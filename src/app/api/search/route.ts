import { openai } from "@ai-sdk/openai"
import { generateObject } from "ai"
import fs from 'fs'
import csv from 'csv-parser'
import { z } from 'zod'
import path from 'path'

export const maxDuration = 30

interface CsvEntry {
  Description: string;
  Patient: string;
  Doctor: string;
}

async function loadCsvData(): Promise<CsvEntry[]> {
  const dataset: CsvEntry[] = []

  return new Promise((resolve, reject) => {
    const datasetPath = path.join(process.cwd(), 'src/data/ai-medical-chatbot.csv')
    fs.createReadStream(datasetPath)
      .pipe(csv())
      .on('data', (row) => {
        dataset.push(row)
      })
      .on('end', () => {
        console.log('CSV file successfully processed')
        resolve(dataset)
      })
      .on('error', (error) => {
        reject(error)
      })
  })
}

function calculateSimilarity(query: string, text: string): number {
  const queryWords = query.toLowerCase().split(/\s+/)
  let score = 0

  for (const word of queryWords) {
    if (text.toLowerCase().includes(word)) {
      score += 2
    }
  }

  return score
}

function filterRelevantData(query: string, dataset: CsvEntry[]) {
  const relevantEntries = []

  for (const entry of dataset) {
    const combinedText = entry.Description + " " + entry.Patient + " " + entry.Doctor
    const score = calculateSimilarity(query, combinedText)

    if (score > 0) {
      relevantEntries.push(entry)
    }
  }

  return relevantEntries
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()
    const query = messages[messages.length - 1].content

    const dataset = await loadCsvData()

    const relevantData = filterRelevantData(query, dataset)

    const relevantDataSnippet = relevantData.slice(0, 5);

    const openAIResult = generateObject({
      model: openai("gpt-3.5-turbo"),
      messages: [
        { role: "system", content: "You are a medical assistant who gives advice based on symptoms." },
        {
          role: "user",
          content: `I have the following symptoms: ${query}. Based on the relevant dataset, suggest the condition, advice, description, and urgency for these symptoms. The relevant data is: \n\n${relevantDataSnippet.map(entry => `Description: ${entry.Description}\nPatient: ${entry.Patient}\nDoctor's advice: ${entry.Doctor}`).join("\n\n---\n\n")}`,
        },
      ],
      schema: z.object({
        condition: z.string().describe("Technical medical possible condition the user could have based on the symptoms"),
        advice: z.string().describe("Give 3 to 5 detailed instructions in a paragraph based on the doctors advice in the dataset. Focus on the treatment and approach mentioned. Avoid general advice or asking the user to visit a doctor, and make sure the response stays aligned with the doctors guidance in the dataset. Only if the sypmtoms of the query doesnt not exceed 100 characters, you can ignore the dataset and provide a general advice."),
        description: z.string().describe("A technical medical description of the type of injury or illness the user has"),
        urgency: z.string().describe("Classify the importance of a quick reaction to the possible problem. Use 'Low', 'Medium', or 'High' as possible values"),
        found: z.boolean().describe("Indicates whether relevant data was found for the query")
      })
    })

    console.log('OpenAI Result:', (await openAIResult).object)
    return new Response(JSON.stringify((await openAIResult).object), { status: 200 });

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: 'An error occurred while processing the request' }), { status: 500 });
  }
}
