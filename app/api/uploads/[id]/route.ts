import { NextResponse } from 'next/server'
import { getStoragePathFromUpload } from '@/lib/eventdrop'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'

export const runtime = 'nodejs'

export async function DELETE(
  _request: Request,
  context: RouteContext<'/api/uploads/[id]'>
) {
  const { id } = await context.params

  if (!id) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Een upload ID is verplicht.',
      },
      { status: 400 }
    )
  }

  try {
    const supabase = createAdminSupabaseClient()
    const { data: upload, error: uploadError } = await supabase
      .from('uploads')
      .select('*')
      .eq('id', id)
      .single()

    if (uploadError) throw uploadError
    if (!upload) {
      return NextResponse.json(
        {
          ok: false,
          error: 'De upload is niet gevonden.',
        },
        { status: 404 }
      )
    }

    const storagePath = getStoragePathFromUpload(upload)

    if (storagePath) {
      const { error: storageError } = await supabase.storage
        .from('event-uploads')
        .remove([storagePath])

      if (storageError) throw storageError
    }

    const { error: deleteError } = await supabase
      .from('uploads')
      .delete()
      .eq('id', id)

    if (deleteError) throw deleteError

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'De upload kon niet worden verwijderd.',
      },
      { status: 500 }
    )
  }
}
