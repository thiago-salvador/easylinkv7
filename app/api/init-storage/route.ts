import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { supabaseConfig } from "@/lib/config";

export async function GET() {
  try {
    // Usar cliente administrativo com acesso direto
    const supabase = createAdminClient();

    // Listar os buckets para verificar se o bucket 'files' existe
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      return NextResponse.json({ error: bucketsError.message }, { status: 500 });
    }

    const filesBucket = buckets?.find(bucket => bucket.name === supabaseConfig.storage.buckets.files);
    
    // Se o bucket não existir, criar
    if (!filesBucket) {
      const { error: createError } = await supabase.storage.createBucket(
        supabaseConfig.storage.buckets.files,
        { public: true } // Permite acesso público para visualização
      );
      
      if (createError) {
        return NextResponse.json({ error: createError.message }, { status: 500 });
      }
      
      return NextResponse.json({ message: `Bucket '${supabaseConfig.storage.buckets.files}' criado com sucesso` });
    }
    
    // Também verificar se a tabela 'files' existe
    const { error: tablesError } = await supabase.from(supabaseConfig.tables.files).select('id', { count: 'exact', head: true });
    
    return NextResponse.json({ 
      message: `Bucket '${supabaseConfig.storage.buckets.files}' já existe`,
      storageReady: true,
      databaseReady: !tablesError,
      buckets
    });
    
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
