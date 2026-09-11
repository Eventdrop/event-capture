/* eslint-disable @typescript-eslint/no-require-imports -- CommonJS test loader for TypeScript modules. */
// Run with: node scripts/test-video-message-upload.cjs
// Network is fully mocked; no credentials or live event are needed.
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const Module = require('node:module')
const ts = require('typescript')

function load(relative, imports = {}) {
  const filename = path.resolve(__dirname, '..', relative)
  const mod = new Module(filename)
  mod.require = (name) => imports[name] || require(name)
  mod._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText, filename)
  return mod.exports
}

const policy = load('lib/video.ts')
const { createVideoMessageUpload, validateVideoMessage } = load('lib/video-message-upload.ts', {
  '@/lib/video': policy,
})
const originalFetch = global.fetch
const originalDocument = global.document
const originalCreateURL = URL.createObjectURL
const originalRevokeURL = URL.revokeObjectURL
let duration = 10, metadataFailure = false, createdURLs = 0, revokedURLs = 0
URL.createObjectURL = () => { createdURLs++; return 'blob:mock-video' }
URL.revokeObjectURL = () => { revokedURLs++ }
global.document = { createElement: () => ({
  duration, pause() {}, load() {}, removeAttribute() {},
  set src(value) { void value; queueMicrotask(() => { if (metadataFailure) this.onerror?.(); else this.onloadedmetadata?.() }) },
}) }
const file = { name: 'message.mp4', type: 'video/mp4', size: 1024 }
const signedUrl = 'https://storage.example.test/signed-upload?token=opaque'
const videoId = '11111111-1111-4111-8111-111111111111'
let calls, states, mode, upload, holdInitiate
const response = (data, ok = true) => ({ ok, json: async () => data })

function reset(nextMode = 'success') {
  calls = []; states = []; mode = nextMode; holdInitiate = null; duration = 10; metadataFailure = false
  upload = createVideoMessageUpload((state, error) => states.push([state, error]))
  global.fetch = async (url, options) => {
    calls.push({ url, options })
    if (url === '/api/videos/initiate') {
      assert.deepEqual(JSON.parse(options.body), {
        identifier: 'event-slug', type: 'video_message',
        extension: mode === 'webm' ? 'webm' : 'mp4',
      })
      if (mode === 'initiate-failure') return response({ ok: false }, false)
      if (mode === 'delayed-initiate') await new Promise(resolve => { holdInitiate = resolve })
      return response({ ok: true, videoId, signedUrl })
    }
    if (url === signedUrl) {
      assert.equal(options.method, 'PUT')
      assert.equal(options.credentials, 'omit')
      assert.equal(options.headers['x-upsert'], 'false')
      assert.equal(options.headers['Content-Type'], mode === 'webm' ? 'video/webm' : 'video/mp4')
      if (mode === 'abort') {
        return new Promise((_, reject) => {
          options.signal.addEventListener('abort', () => reject(new Error('aborted')), { once: true })
          upload.cancel()
        })
      }
      return response({}, mode !== 'upload-failure')
    }
    assert.deepEqual(JSON.parse(options.body), { videoId })
    if (url === '/api/videos/finalize') {
      assert.equal(states.at(-1)[0], 'finalizing')
      assert.equal(states.some(([s]) => s === 'success'), false)
      if (mode === 'finalize-failure') return response({ ok: false }, false)
      if (mode === 'unconfirmed') return response({ ok: true, status: 'pending_upload', videoId })
      return response({ ok: true, status: 'ready', videoId })
    }
    assert.equal(url, '/api/videos/cancel')
    assert.equal(options.keepalive, true)
    if (mode === 'cancel-failure') throw new Error('offline')
    return response({ ok: true, status: 'failed' })
  }
}

async function main() {
  reset()
  await upload.start('event-slug', file)
  assert.deepEqual(states.map(([s]) => s), ['checking', 'uploading', 'finalizing', 'success'])
  assert.deepEqual(calls.map(c => c.url), ['/api/videos/initiate', signedUrl, '/api/videos/finalize'])

  reset('webm')
  await upload.start('event-slug', { ...file, name: 'message.WEBM', type: 'video/webm;codecs=vp9' })
  assert.equal(states.at(-1)[0], 'success')

  for (const [badFile, reason] of [
    [{ ...file, name: 'message.mov', type: 'video/quicktime' }, 'type'],
    [{ ...file, type: 'image/png' }, 'type'],
    [{ ...file, size: policy.videoPolicies.video_message.maxSizeBytes + 1 }, 'size'],
    [{ ...file, size: 0 }, 'empty'],
  ]) {
    reset(); await upload.start('event-slug', badFile)
    assert.deepEqual(states, [['error', reason]])
    assert.equal(calls.length, 0)
  }
  assert.equal(validateVideoMessage({ ...file, size: 25 * 1024 * 1024 }), null)
  assert.equal(validateVideoMessage({ ...file, type: '' }), null)

  for (const [failure, reason] of [
    ['upload-failure', 'upload'], ['finalize-failure', 'finalize'],
    ['unconfirmed', 'finalize'], ['abort', 'cancelled'],
  ]) {
    reset(failure); await upload.start('event-slug', file)
    assert.deepEqual(states.at(-1), ['error', reason])
    assert.equal(states.some(([s]) => s === 'success'), false)
    assert.equal(calls.at(-1).url, '/api/videos/cancel')
  }

  reset('initiate-failure'); await upload.start('event-slug', file)
  assert.equal(calls.length, 1)
  assert.deepEqual(states.at(-1), ['error', 'upload'])

  reset('delayed-initiate')
  const first = upload.start('event-slug', file)
  await upload.start('event-slug', file)
  while (!holdInitiate) await Promise.resolve()
  assert.equal(calls.length, 1, 'duplicate start cannot create another pending row')
  holdInitiate(); await first
  assert.equal(states.at(-1)[0], 'success')

  reset('delayed-initiate')
  const pending = upload.start('event-slug', file)
  while (!holdInitiate) await Promise.resolve()
  upload.cancel(); holdInitiate(); await pending
  assert.deepEqual(calls.map(c => c.url), ['/api/videos/initiate', '/api/videos/cancel'])
  assert.deepEqual(states.at(-1), ['error', 'cancelled'])

  reset('upload-failure')
  const fetchMock = global.fetch
  global.fetch = (url, options) => {
    if (url === '/api/videos/cancel') mode = 'cancel-failure'
    return fetchMock(url, options)
  }
  await upload.start('event-slug', file)
  assert.deepEqual(states.at(-1), ['error', 'upload'])
  mode = 'success'
  await upload.start('event-slug', file)
  assert.equal(states.at(-1)[0], 'success', 'lock released after errors')
  for (const seconds of [14.9, 15, 15.001]) {
    reset(); duration = seconds
    await upload.start('event-slug', file)
    assert.equal(states.at(-1)[0], seconds <= 15 ? 'success' : 'error')
    if (seconds > 15) { assert.equal(calls.length, 0); assert.equal(states.at(-1)[1], 'duration') }
  }
  for (const value of [NaN, Infinity, 0]) {
    reset(); duration = value; await upload.start('event-slug', file)
    assert.equal(calls.length, 0); assert.equal(states.at(-1)[1], 'metadata')
  }
  reset(); metadataFailure = true; await upload.start('event-slug', file)
  assert.equal(calls.length, 0); assert.equal(states.at(-1)[1], 'metadata')
  reset(); const checking = upload.start('event-slug', file); upload.cancel(); await checking
  assert.equal(calls.length, 0); assert.equal(states.at(-1)[1], 'cancelled')
  assert.equal(createdURLs, revokedURLs, 'all temporary URLs released')
  assert.ok(!fs.readFileSync(path.resolve(__dirname, '../app/event/[id]/page.tsx'), 'utf8').includes('VideoMessageUpload'))
  console.log('PASS: duration boundaries, metadata failure/abort and URL cleanup; MP4/WebM success, validation/size boundary, upload/finalize failures, cancellation/abort, initiation cancellation, cleanup failure, retry and duplicate-click protection.')
}

main().catch(error => { console.error(error); process.exitCode = 1 })
  .finally(() => { global.fetch = originalFetch; global.document = originalDocument; URL.createObjectURL = originalCreateURL; URL.revokeObjectURL = originalRevokeURL })
