import { Info } from "lucide-react"
import Link from "next/link"

export function UIHeader() {
  return (
    <header className="border-b">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          Medical Symptom Advisor
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="#disclaimer"
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <Info className="h-4 w-4" />
            <span>Disclaimer</span>
          </Link>
        </div>
      </div>
    </header>
  )
}

