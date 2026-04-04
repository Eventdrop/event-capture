'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Page() {
  const params = useParams()
  const eventId = params.id as string

  const [items, setItems] = useState<any[]>([])
  const [eventName, setEventName] = useState('Event Gallery')
  const [selected, setSelected] = useState<string[]>([])

  useEffect(() => {
    const load = async () => {
      const { data: uploads } = await supabase
        .from('uploads')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false })

      const { data: event } = await supabase
        .from('events')
        .select('name')
        .eq('id', eventId)
        .single()

      setItems(uploads || [])
      setEventName(event?.name || 'Event Gallery')
    }

    load()
  }, [eventId])

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((itemId) => itemId !== id)
        : [...prev, id]
    )
  }

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const blobUrl = window.URL.createObjectURL(blob)

      const a = document.createElement('a')
      a.href = blobUrl
      a.download = filename
      a.click()

      window.URL.revokeObjectURL(blobUrl)
    } catch (error) {
      console.error('Download failed', error)
      alert('Download failed')
    }
  }

  const downloadSelected = async () => {
    const selectedItems = items.filter((item) => selected.includes(item.id))

    for (const item of selectedItems) {
      await handleDownload(item.file_url, `event-upload-${item.id}.jpg`)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">{eventName}</h1>
            <p className="text-sm text-gray-500 break-all mt-1">
              Event ID: {eventId}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={downloadSelected}
              disabled={selected.length === 0}
              className={`rounded-xl px-4 py-3 text-sm font-medium ${
                selected.length === 0
                  ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                  : 'bg-black text-white'
              }`}
            >
              Download Selected ({selected.length})
            </button>

            <a
              href={`/event/${eventId}`}
              className="inline-block bg-white border text-black rounded-xl px-4 py-3 text-sm font-medium text-center"
            >
              Back to Upload
            </a>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="bg-white border rounded-2xl p-8 text-center text-gray-500">
            No uploads yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((i) => {
              const isSelected = selected.includes(i.id)

              return (
                <div
                  key={i.id}
                  className={`bg-white border rounded-2xl overflow-hidden shadow-sm ${
                    isSelected ? 'ring-2 ring-black' : ''
                  }`}
                >
                  <div className="relative group">
                    <img
                      src={i.file_url}
                      className="w-full h-72 object-cover"
                    />

                    <button
                      onClick={() => toggleSelect(i.id)}
                      className={`absolute top-3 left-3 text-xs px-3 py-2 rounded-lg font-medium ${
                        isSelected
                          ? 'bg-green-600 text-white'
                          : 'bg-white/90 text-black'
                      }`}
                    >
                      {isSelected ? 'Selected ✓' : 'Select'}
                    </button>

                    <button
                      onClick={() => handleDownload(i.file_url, `event-upload-${i.id}.jpg`)}
                      className="absolute bottom-3 right-3 bg-black/80 text-white text-xs px-3 py-2 rounded-lg opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition"
                    >
                      Download
                    </button>
                  </div>

                  <div className="p-3">
                    <p className="text-xs text-gray-400">
                      {i.created_at ? new Date(i.created_at).toLocaleString() : ''}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
