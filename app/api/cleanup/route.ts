import { NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'
import { getStoragePathFromUpload, type UploadRecord } from '@/lib/eventdrop'

export const runtime = 'nodejs'

type CleanupUpload = UploadRecord & {
  event_id?: string | null
}

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret) {
    return NextResponse.json(
      {
        ok: false,
        error: 'CRON_SECRET is not configured.',
      },
      { status: 500 }
    )
  }

  const authHeader = request.headers.get('authorization')

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Unauthorized.',
      },
      { status: 401 }
    )
  }

  try {
    const supabase = createAdminSupabaseClient()

    let uploads: CleanupUpload[] = []

    const richQuery = await supabase
      .from('uploads')
      .select('*')
      .lte('expires_at', new Date().toISOString())

    if (!richQuery.error) {
      uploads = (richQuery.data || []) as CleanupUpload[]
    } else {
      const fallbackQuery = await supabase
        .from('uploads')
        .select('*')
        .lt('created_at', new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString())

      if (fallbackQuery.error) {
        throw new Error(
          `Failed to load expired uploads: ${fallbackQuery.error.message}`
        )
      }

      uploads = (fallbackQuery.data || []) as CleanupUpload[]
    }

    const storagePaths = uploads
      .map((upload) => getStoragePathFromUpload(upload))
      .filter((value): value is string => Boolean(value))

    if (storagePaths.length > 0) {
      const { error: storageError } = await supabase.storage
        .from('event-uploads')
        .remove(storagePaths)

      if (storageError) {
        throw new Error(`Failed to remove storage files: ${storageError.message}`)
      }
    }

    if (uploads.length > 0) {
      const ids = uploads.map((upload) => upload.id)
      const { error: deleteError } = await supabase
        .from('uploads')
        .delete()
        .in('id', ids)

      if (deleteError) {
        throw new Error(`Failed to remove upload records: ${deleteError.message}`)
      }
    }

    return NextResponse.json({
      ok: true,
      deletedRecords: uploads.length,
      deletedFiles: storagePaths.length,
    })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Cleanup failed.',
      },
      { status: 500 }
    )
  }
}

export const POST = GET
