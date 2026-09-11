// Run: node scripts/test-video-message-gallery.mjs (no network or real credentials).
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import Module, { createRequire } from 'node:module'
import ts from 'typescript'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
const requireModule = createRequire(import.meta.url)
function load(file, imports = {}) {
  const filename = path.resolve(file)
  const mod = new Module(filename)
  mod.require = name => imports[name] || requireModule(name)
  mod._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX },
  }).outputText, filename)
  return mod.exports
}
process.env.ADMIN_SESSION_SECRET = 'mock-gallery-secret'
const access = load('lib/video-access.ts')
const event = '22222222-2222-4222-8222-222222222222'
const other = '33333333-3333-4333-8333-333333333333'
let token, rows, signed, broken, ranges
function reset() { token = access.createVideoAccessGrant(event); rows = []; signed = []; broken = false; ranges = [] }
function row(n, extra = {}) {
  const id = `11111111-1111-4111-8111-${String(n).padStart(12, '0')}`
  const video = { id, event_id: event, type: 'video_message', status: 'ready', created_at: `2026-09-${String(n).padStart(2, '0')}`, storage_path: `${event}/${id}/original.mp4`, ...extra }
  rows.push(video); return video
}
const client = {
  from(table) {
    const filters = []; let range
    const q = {
      select() { return q }, eq(k, v) { filters.push(r => r[k] === v); return q }, order() { return q },
      range(a, b) { ranges.push([a, b]); range = [a, b]; return q },
      maybeSingle() { return Promise.resolve({ data: { id: event } }) },
      then(resolve) {
        assert.equal(table, 'event_videos')
        return Promise.resolve({ data: rows.filter(r => filters.every(f => f(r))).slice(range[0], range[1] + 1) }).then(resolve)
      },
    }
    return q
  },
  storage: { from(bucket) {
    assert.equal(bucket, 'event-videos')
    return { async createSignedUrl(storagePath, seconds) {
      assert.ok(seconds > 0 && seconds <= 600)
      signed.push({ storagePath, seconds })
      if (broken && storagePath === rows[0].storage_path) throw new Error('Missing object')
      return { data: { signedUrl: `https://storage.test/playback/${signed.length}` } }
    } }
  } },
}
const { GET } = load('app/api/videos/list/route.ts', {
  '@/lib/supabase-admin': { createAdminSupabaseClient: () => client },
  '@/lib/video-access': access,
  'next/headers': { cookies: async () => ({ get: () => token ? { value: token } : undefined }) },
  'next/server': { NextResponse: { json: (body, options) => ({ body, ...options }) } },
})
const call = (query = 'identifier=event-slug') => GET(new Request(`https://eventdrop.test/api/videos/list?${query}`))
reset(); const own = row(1); row(2, { event_id: other }); row(3, { status: 'pending_upload' }); row(4, { status: 'failed' }); row(5, { type: 'event_video' }); row(6, { status: 'hidden' }); row(7, { status: 'uploaded' })
let response = await call()
assert.deepEqual(response.body.videos.map(v => v.id), [own.id]); assert.equal(signed.length, 1)
assert.deepEqual(Object.keys(response.body.videos[0]).sort(), ['createdAt', 'id', 'playbackUrl'])
assert.equal(response.headers['Cache-Control'], 'private, no-store')
reset(); response = await call(); assert.deepEqual(response.body.videos, []); assert.equal(response.body.hasMore, false)
for (const invalid of [null, 'tampered', access.createVideoAccessGrant(other)]) {
  reset(); token = invalid; response = await call(); assert.ok([401, 403].includes(response.status)); assert.equal(signed.length, 0)
}
reset(); row(1); token = token.slice(0, -4) + 'xxxx'; assert.equal((await call()).status, 403)

const realNow = Date.now
try {
  reset(); row(1)
  const issued = realNow()
  Date.now = () => issued + (access.VIDEO_ACCESS_MAX_AGE - 30) * 1000
  assert.equal((await call()).status, 200)
  assert.ok(signed[0].seconds <= 30)
  Date.now = () => issued + (access.VIDEO_ACCESS_MAX_AGE + 1) * 1000
  assert.equal((await call()).status, 403)
} finally { Date.now = realNow }

reset(); row(1); row(2); broken = true; response = await call(); assert.equal(response.body.videos[0].playbackUrl, null); assert.ok(response.body.videos[1].playbackUrl)
reset(); row(1, { storage_path: `${other}/arbitrary.mp4` }); response = await call(); assert.equal(signed.length, 0); assert.equal(response.body.videos[0].playbackUrl, null)
reset(); assert.equal((await call('identifier=event-slug&path=arbitrary')).status, 400)
reset(); for (let i = 1; i <= 26; i++) row(i); response = await call(); assert.equal(response.body.videos.length, 24); assert.equal(response.body.hasMore, true); assert.equal(signed.length, 24); assert.deepEqual(ranges, [[0, 24]])
response = await call('identifier=event-slug&offset=24'); assert.equal(response.body.videos.length, 2); assert.equal(response.body.hasMore, false)
// Render UI with deterministic hook state; network/effects are tested separately above.
const t = load('lib/i18n.ts').translations.en
let hookValues = []
const components = load('app/_components/video-message-gallery.tsx', {
  react: { ...React, useEffect() {}, useState(initial) { return [hookValues.length ? hookValues.shift() : initial, () => {}] } },
  '@/app/_components/language-provider': { useLanguage: () => ({ t }) },
  '@/app/_components/video-message-upload': { VideoMessageUpload: () => null },
})
function renderGallery(result, error = false) {
  hookValues = [0, 0, result, error]
  return renderToStaticMarkup(React.createElement(components.VideoMessageGallery, { identifier: 'event-slug' }))
}
assert.match(renderGallery({ videos: [], hasMore: false }), /No video messages yet/)
assert.match(renderGallery(null), /Loading videos/)
assert.match(renderGallery(null, true), /could not be loaded/)
const videos = [1, 2].map(id => ({ id: String(id), createdAt: '2026-09-11', playbackUrl: `https://storage.test/${id}` }))
let html = renderGallery({ videos, hasMore: false })
assert.equal((html.match(/<video /g) || []).length, 2); assert.equal((html.match(/preload="metadata"/g) || []).length, 2); assert.ok(!html.includes('autoPlay'))
html = renderGallery({ videos: [{ ...videos[0], playbackUrl: null }, videos[1]], hasMore: false })
assert.equal((html.match(/<video /g) || []).length, 1); assert.match(html, /cannot be played/)
hookValues = [true, false]
html = renderToStaticMarkup(React.createElement(components.VideoMessagePlayer, { video: videos[0], refresh() {} }))
assert.match(html, /link has expired/); assert.ok(!html.includes('<video '))
console.log('PASS: event/session authorization, ready/type filters, empty/multiple results, safe signing, per-object failure, bounded pagination, and empty/loading/error/multiple/broken player rendering.')

for (const dimensions of [{ width: 1080, height: 1920 }, { width: 1920, height: 1080 }, { width: 720, height: 1280 }]) {
  hookValues = [false, false, dimensions]
  const markup = renderToStaticMarkup(React.createElement(components.VideoMessagePlayer, { video: videos[0], refresh() {} }))
  assert.ok(markup.includes(`data-orientation="${dimensions.height > dimensions.width ? 'portrait' : 'landscape'}"`))
  assert.ok(markup.includes(`aspect-ratio:${dimensions.width} / ${dimensions.height}`))
  assert.ok(markup.includes('object-contain')); assert.ok(!markup.includes('aspect-video'))
}
for (const dimensions of [[{ width: 9, height: 16 }, { width: 9, height: 16 }], [{ width: 9, height: 16 }, { width: 16, height: 9 }]]) {
  hookValues = [0, 0, { videos, hasMore: false }, false, false, false, dimensions[0], false, false, dimensions[1]]
  const markup = renderToStaticMarkup(React.createElement(components.VideoMessageGallery, { identifier: 'event-slug' }))
  assert.equal((markup.match(/<video /g) || []).length, 2)
  assert.equal((markup.match(/data-orientation="portrait"/g) || []).length, dimensions.filter(d => d.height > d.width).length)
}
console.log('PASS: portrait MP4/WebM dimensions, landscape dimensions, natural aspect ratios, containment, multiple portraits and mixed orientation.')
