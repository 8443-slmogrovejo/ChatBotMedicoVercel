"use client"

import type React from "react"

import { useState } from "react"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function Home() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!query.trim()) return;
  
    setLoading(true);
  
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: [{ role: "user", content: query }] }),
      });
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
    }
  }
  
  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-24">
      <div className="max-w-3xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Medical Symptom Advisor</h1>
          <p className="mt-2 text-muted-foreground">Enter your symptoms to get basic medical information</p>
        </div>

        <form onSubmit={handleSearch} className="flex w-full gap-2">
          <Input
            type="text"
            placeholder="e.g., I have a headache"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" disabled={loading}>
            {loading ? "Searching..." : <Search className="h-4 w-4 mr-2" />}
            Search
          </Button>
        </form>

        {results && (
          <Tabs defaultValue="results" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="results">Results</TabsTrigger>
              <TabsTrigger value="disclaimer">Medical Disclaimer</TabsTrigger>
            </TabsList>
            <TabsContent value="results">
              <Card>
                <CardHeader>
                  <CardTitle>Results for: {query}</CardTitle>
                  <CardDescription>Based on your symptoms, here's our suggests</CardDescription>
                </CardHeader>
                <CardContent>
                  {results.found ? (
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium">Possible condition:</h3>
                        <p>{results.condition}</p>
                      </div>
                      <div>
                        <h3 className="font-medium">Recommended actions:</h3>
                        <p>{results.advice}</p>
                      </div>
                      {results.description && (
                        <div>
                          <h3 className="font-medium">Description:</h3>
                          <p>{results.description}</p>
                        </div>
                      )}
                      {results.urgency && (
                        <Alert
                          className={
                            results.urgency === "high"
                              ? "bg-red-50 border-red-200 text-red-800"
                              : results.urgency === "medium"
                                ? "bg-yellow-50 border-yellow-200 text-yellow-800"
                                : "bg-blue-50 border-blue-200 text-blue-800"
                          }
                        >
                          <AlertTitle>
                            {results.urgency === "high"
                              ? "Seek immediate medical attention"
                              : results.urgency === "medium"
                                ? "Medical attention recommended"
                                : "Self-care may be appropriate"}
                          </AlertTitle>
                          <AlertDescription>
                            {results.urgency === "high"
                              ? "These symptoms may require urgent medical care."
                              : results.urgency === "medium"
                                ? "Consider consulting with a healthcare provider."
                                : "Monitor your symptoms and consult a doctor if they worsen."}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p>
                        No specific information found for your symptoms. If symptoms persist, please consult a
                        healthcare professional.
                      </p>
                      <Alert>
                        <AlertTitle>Not finding what you need?</AlertTitle>
                        <AlertDescription>
                          Try being more specific about your symptoms, including location, duration, and severity.
                        </AlertDescription>
                      </Alert>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="disclaimer">
              <Card>
                <CardHeader>
                  <CardTitle>Medical Disclaimer</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    This application provides general information for educational purposes only. It is not a substitute
                    for professional medical advice, diagnosis, or treatment.
                  </p>
                  <p>
                    Always seek the advice of your physician or other qualified health provider with any questions you
                    may have regarding a medical condition.
                  </p>
                  <Alert className="bg-red-50 border-red-200 text-red-800">
                    <AlertTitle>Important</AlertTitle>
                    <AlertDescription>
                      If you think you may have a medical emergency, call your doctor or emergency services immediately.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </main>
  )
}

