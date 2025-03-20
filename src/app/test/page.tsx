"use client"
import { useState } from "react"

export default function TestPage() {
  const [result, setResult] = useState<{ success?: boolean; message?: string; error?: string } | null>(null)
  const [loading, setLoading] = useState(false)

  const testAPI = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/test")
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ success: false, error: (error as any).message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">OpenAI API Test</h1>

      <button
        onClick={testAPI}
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-blue-300"
      >
        {loading ? "Testing..." : "Test OpenAI API"}
      </button>

      {result && (
        <div className="mt-4 p-4 border rounded">
          <p className="font-semibold">
            Status:
            <span className={result.success ? "text-green-600" : "text-red-600"}>
              {result.success ? " Working" : " Error"}
            </span>
          </p>

          {result.message && <p className="mt-2">{result.message}</p>}

          {result.error && <p className="mt-2 text-red-600">{result.error}</p>}
        </div>
      )}
    </div>
  )
}

