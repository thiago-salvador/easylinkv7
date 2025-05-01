import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerClient()
    const fileId = params.id

    // Get file data from database
    const { data: fileData, error: dbError } = await supabase.from("files").select("*").eq("id", fileId).single()

    if (dbError || !fileData) {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    // Get the public URL
    const { data: publicUrlData } = supabase.storage.from("files").getPublicUrl(fileData.file_path)

    // Log the access
    await supabase.from("file_access_logs").insert({
      file_id: fileId,
      ip_address: request.headers.get("x-forwarded-for") || request.ip || "unknown",
      user_agent: request.headers.get("user-agent") || "unknown",
    })

    // Increment view count
    await supabase
      .from("files")
      .update({ view_count: (fileData.view_count || 0) + 1 })
      .eq("id", fileId)

    return NextResponse.json({
      id: fileData.id,
      fileName: fileData.original_filename,
      fileType: fileData.file_type,
      url: publicUrlData.publicUrl,
      contentType: fileData.content_type,
      viewCount: fileData.view_count + 1,
    })
  } catch (error) {
    console.error("Error fetching file:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
