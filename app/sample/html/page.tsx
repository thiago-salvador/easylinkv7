import { HTMLViewer } from "@/components/html-viewer"

export default function SampleHTMLPage() {
  // Using a sample HTML URL for demonstration
  const sampleHtmlUrl = "https://example.com"

  return (
    <div className="h-screen">
      <HTMLViewer fileUrl={sampleHtmlUrl} fileName="sample.html" />
    </div>
  )
}
