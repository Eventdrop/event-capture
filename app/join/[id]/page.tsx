import { EventAccessForm } from '@/app/_components/event-access-form'
import { SiteFooter } from '@/app/_components/site-footer'
import { SiteHeader } from '@/app/_components/site-header'
import { normalizeEventRecord } from '@/lib/events'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'

export default async function JoinPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ returnTo?: string }>
}) {
  const { id } = await params
  const { returnTo } = await searchParams
  const supabase = createAdminSupabaseClient()

  const idLookup = await supabase.from('events').select('*').eq('id', id).single()
  const slugLookup =
    idLookup.error && !idLookup.data
      ? await supabase.from('events').select('*').eq('slug', id).single()
      : null

  const event = normalizeEventRecord(idLookup.data || slugLookup?.data || null)
  const requireCode = Boolean(event?.accessCode)

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="dutch-grid flex-1 bg-[linear-gradient(180deg,_#faf6ef_0%,_#f3ede2_48%,_#edf4fb_100%)] text-[#0F2135]">
        <section className="mx-auto grid w-full max-w-3xl gap-8 px-6 py-20 md:px-10">
          <div className="rounded-[2.2rem] border border-[#D4DFEE] bg-white/85 p-7 shadow-[0_18px_54px_rgba(15,61,102,0.08)]">
            <EventAccessForm
              eventIdentifier={id}
              returnTo={returnTo || ''}
              requireCode={requireCode}
            />
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
