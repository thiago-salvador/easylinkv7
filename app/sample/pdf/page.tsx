import { PDFViewer } from "@/components/pdf-viewer"

export default function SamplePDFPage() {
  // Using a sample PDF URL for demonstration
  const samplePdfUrl = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"

  return (
    <div className="h-screen">
      <PDFViewer fileUrl={samplePdfUrl} fileName="sample.pdf" />
    </div>
  )
}
