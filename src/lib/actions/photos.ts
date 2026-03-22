'use server'

import { createAdminClient } from '@/lib/supabase/admin'

export async function uploadJobPhoto(jobId: string, formData: FormData): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const file = formData.get('photo') as File
    if (!file) return { success: false, error: 'No file provided' }

    const supabase = createAdminClient()
    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `jobs/${jobId}/${Date.now()}.${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())

    const { error } = await supabase.storage
      .from('job-media')
      .upload(path, buffer, {
        contentType: file.type,
        upsert: true,
      })

    if (error) return { success: false, error: error.message }

    const { data: urlData } = supabase.storage.from('job-media').getPublicUrl(path)
    return { success: true, url: urlData.publicUrl }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Upload failed' }
  }
}
