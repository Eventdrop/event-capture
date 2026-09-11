// Fully mocked rendering and form submission; never sends access requests.
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
  mod.require = name => imports[name] || (name.endsWith('.css') ? { default: {}, __esModule: true } : requireModule(name))
  mod._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX },
  }).outputText, filename)
  return mod.exports
}
const { translations, locales } = load('lib/i18n.ts')
let locale = 'nl', activeTab = 0
const language = { useLanguage: () => ({ locale, t: translations[locale], setLocale() {} }) }
const Home = load('app/_components/marketing-home.tsx', {
  react: { ...React, useEffect() {}, useRef: () => ({ current: false }), useState: () => [activeTab, () => {}] },
  '@/app/_components/language-provider': language,
  '@/lib/i18n': { locales },
  'next/image': { default: () => null, __esModule: true },
  '@/app/_components/language-switcher': { LanguageSwitcher: () => React.createElement('button', { 'data-selector': true }, locale) },
  '@/app/_components/event-access-form': { EventAccessForm: () => React.createElement('form', null, translations[locale].home.accessHint) },
}).default
const escaped = text => text.replaceAll('&', '&amp;').replaceAll("'", '&#x27;').replaceAll('"', '&quot;')
for (locale of locales) {
  const copy = translations[locale].marketing
  assert.deepEqual(Object.keys(copy), Object.keys(translations.nl.marketing))
  assert.ok(Object.values(copy).every(v => typeof v === 'string' && v.length > 0))
  for (activeTab of [0, 1, 2, 3]) {
    const html = renderToStaticMarkup(React.createElement(Home))
    for (const text of [copy.heroTitle, copy.heroAccent, copy.featureTitle, copy.weddings, copy.corporate, copy.scanBody, translations[locale].home.accessHint]) assert.ok(html.includes(escaped(text)), `${locale}: ${text}`)
    assert.equal((html.match(/data-selector/g) || []).length, 1)
    assert.equal((html.match(/<form/g) || []).length, 1)
    assert.equal((html.match(/href="#jouw-event"/g) || []).length, 2)
    assert.ok(!html.includes('Maak van losse momenten'))
    assert.ok(html.includes('href="#hoe-werkt-het"'))
    if (activeTab === 1) assert.ok(html.includes(escaped(copy.wordsBody)))
    if (activeTab === 2) assert.ok(html.includes(escaped(copy.message1)))
    if (activeTab === 3) assert.ok(html.includes(escaped(copy.wallBody)))
  }
}
let state, index
const Form = load('app/_components/event-access-form.tsx', {
  react: { ...React, useState(initial) { const slot = index++; if (!(slot in state)) state[slot] = initial; return [state[slot], value => { state[slot] = value }] }, useTransition: () => [false, fn => fn()] },
  '@/app/_components/language-provider': language,
}).EventAccessForm
function renderForm() { index = 0; return Form({}) }
function submit() { return renderForm().props.onSubmit({ preventDefault() {} }) }
const oldFetch = global.fetch, oldWindow = global.window
let calls = [], redirect
try {
  global.window = { location: { assign(url) { redirect = url } } }
  global.fetch = async (url, options) => {
    calls.push({ url, body: JSON.parse(options.body) })
    return { ok: true, json: async () => ({ redirectTo: '/event/mock-event' }) }
  }
  state = []; locale = 'nl'; await submit()
  assert.equal(state[3], 'emailRequired'); assert.equal(calls.length, 0)
  for (locale of locales) {
    const html = renderToStaticMarkup(renderForm())
    assert.ok(html.includes(escaped(translations[locale].home.emailRequired)))
    assert.ok(html.includes(escaped(translations[locale].home.emailLabel)))
  }
  state[0] = 'preview@example.invalid'; await submit(); assert.equal(state[3], 'codeRequired')
  state[1] = 'DEMO'
  for (locale of locales) {
    await submit()
    const sent = calls.at(-1)
    assert.equal(sent.url, '/api/public-events/access')
    assert.deepEqual(sent.body, { email: 'preview@example.invalid', code: 'DEMO', identifier: '', locale, marketingConsent: false, returnTo: '' })
    assert.equal(redirect, '/event/mock-event'); assert.equal(state[3], 'accessGranted')
    assert.equal(state[0], 'preview@example.invalid'); assert.equal(state[1], 'DEMO')
  }
  global.fetch = async () => ({ ok: false, json: async () => ({ errorCode: 'INVALID_CODE' }) })
  await submit(); assert.equal(state[3], 'accessError')
} finally { global.fetch = oldFetch; global.window = oldWindow }
console.log('PASS: all five locales, all preview tabs, complete translation keys, one selector/form, two entry anchors, localized form validation, retained input, request locale/payload and redirect behavior.')
