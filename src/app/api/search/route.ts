import { openai } from "@ai-sdk/openai"
import { generateObject } from "ai"
import fs from 'fs'
import csv from 'csv-parser'
import { z } from 'zod'

export const maxDuration = 30

// Función para cargar el CSV de forma eficiented
async function loadCsvData(): Promise<any[]> {
  const dataset: any[] = []

  return new Promise((resolve, reject) => {
    fs.createReadStream('data/ai-medical-chatbot.csv')
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

// Filtrar las entradas relevantes basadas en la consulta
function filterRelevantData(query: string, dataset: any[]) {
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

// Crear la función para generar la consulta a OpenAI
export async function POST(req: Request) {
  try {
    const { messages } = await req.json()
    const query = messages[messages.length - 1].content // La última entrada es la consulta del usuario

    // Cargar el dataset
    const dataset = await loadCsvData()

    // Filtrar las entradas relevantes del dataset
    const relevantData = filterRelevantData(query, dataset)

    const relevantDataSnippet = relevantData.slice(0, 5);

    // Enviamos las entradas filtradas a OpenAI para generar la respuesta
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
        advice: z.string().describe("The advice you recommend to the user to do based on the symptoms, give them 3 to 5 detailed instructions (in one paragraph) and avoid telling them to go to the doctor. Consider the dataset to generate the advice."),
        description: z.string().describe("A technical medical description of the type of injury or illness the user has"),
        urgency: z.string().describe("The urgency you assigned based on the context you have"),
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
