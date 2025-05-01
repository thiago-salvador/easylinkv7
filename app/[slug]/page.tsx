import { createServerClient } from "@/lib/supabase"
import { FileViewer } from "@/components/file-viewer"
import { notFound } from "next/navigation"

interface SlugPageProps {
  params: {
    slug: string
  }
}

export default async function SlugPage({ params }: SlugPageProps) {
  const { slug } = params
  const supabase = createServerClient()

  // Get file data from database
  const { data: fileData, error } = await supabase.from("files").select("*").eq("custom_slug", slug).single()

  if (error || !fileData) {
    notFound()
  }

  // Get the public URL
  const { data: publicUrlData } = supabase.storage.from("files").getPublicUrl(fileData.file_path)

  // Log the access
  await supabase.from("file_access_logs").insert({
    file_id: fileData.id,
    ip_address: "server-side-render",
    user_agent: "server-side-render",
  })

  // Increment view count
  await supabase
    .from("files")
    .update({ view_count: (fileData.view_count || 0) + 1 })
    .eq("id", fileData.id)

  // Determine if this is a premium user (based on your business logic)
  // For example, check if the file was uploaded by a premium user
  const isPremium = fileData.is_premium || false

  return (
    <div className="h-screen">
      <FileViewer
        fileId={fileData.id}
        fileType={fileData.file_type}
        fileUrl={publicUrlData.publicUrl}
        fileName={fileData.original_filename}
        isPremium={isPremium}
      />
    </div>
  )
}
