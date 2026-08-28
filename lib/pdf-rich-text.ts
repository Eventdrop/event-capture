import fs from 'node:fs'
import path from 'node:path'
import emojiRegex from 'emoji-regex'
import twemoji from 'twemoji'

type RichPdfTextToken = {
  emojiPath?: string
  text: string
  type: 'emoji' | 'newline' | 'space' | 'text'
  width: number
}

type RichPdfTextLine = {
  tokens: RichPdfTextToken[]
  width: number
}

export type RichPdfTextOptions = {
  color: string
  emojiScale?: number
  font: string
  fontSize: number
  lineGap?: number
  width: number
  x: number
  y: number
}

const EMOJI_ASSET_DIR = path.join(
  process.cwd(),
  'node_modules/twemoji-emojis/vendor/72x72'
)
const emojiPathCache = new Map<string, string | null>()

function segmentGraphemes(text: string) {
  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' })
    return Array.from(segmenter.segment(text), (part) => part.segment)
  }

  return Array.from(text)
}

function isEmojiGrapheme(value: string) {
  const regex = emojiRegex()
  return regex.test(value)
}

function resolveEmojiAsset(value: string) {
  const cached = emojiPathCache.get(value)
  if (cached !== undefined) return cached

  const codePoint = twemoji.convert.toCodePoint(value)
  const candidates = Array.from(
    new Set([
      codePoint,
      codePoint.replace(/-fe0f/g, ''),
      codePoint.replace(/fe0f-/g, ''),
    ])
  )
  const resolved =
    candidates
      .map((candidate) => path.join(EMOJI_ASSET_DIR, `${candidate}.png`))
      .find((emojiPath) => fs.existsSync(emojiPath)) || null

  emojiPathCache.set(value, resolved)
  return resolved
}

function tokenizeRichPdfText(
  document: PDFKit.PDFDocument,
  text: string,
  options: Pick<RichPdfTextOptions, 'emojiScale' | 'font' | 'fontSize'>
) {
  const emojiSize = options.fontSize * (options.emojiScale ?? 1.08)

  document.font(options.font).fontSize(options.fontSize)

  return segmentGraphemes(text).map<RichPdfTextToken>((segment) => {
    if (segment === '\n') {
      return { text: segment, type: 'newline', width: 0 }
    }

    if (/^\s$/.test(segment)) {
      return {
        text: segment,
        type: 'space',
        width: document.widthOfString(segment),
      }
    }

    if (isEmojiGrapheme(segment)) {
      const emojiPath = resolveEmojiAsset(segment)

      return {
        emojiPath: emojiPath || undefined,
        text: segment,
        type: emojiPath ? 'emoji' : 'text',
        width: emojiPath ? emojiSize : document.widthOfString(segment),
      }
    }

    return {
      text: segment,
      type: 'text',
      width: document.widthOfString(segment),
    }
  })
}

function wrapRichPdfText(
  document: PDFKit.PDFDocument,
  text: string,
  options: Pick<RichPdfTextOptions, 'emojiScale' | 'font' | 'fontSize' | 'width'>
) {
  const tokens = tokenizeRichPdfText(document, text, options)
  const lines: RichPdfTextLine[] = []
  let current: RichPdfTextLine = { tokens: [], width: 0 }

  const pushLine = () => {
    while (current.tokens[0]?.type === 'space') {
      current.width -= current.tokens[0].width
      current.tokens.shift()
    }
    while (current.tokens.at(-1)?.type === 'space') {
      current.width -= current.tokens.at(-1)?.width || 0
      current.tokens.pop()
    }
    lines.push(current)
    current = { tokens: [], width: 0 }
  }

  for (const token of tokens) {
    if (token.type === 'newline') {
      pushLine()
      continue
    }

    if (current.tokens.length > 0 && current.width + token.width > options.width) {
      const lastSpaceIndex = current.tokens
        .map((item) => item.type)
        .lastIndexOf('space')

      if (lastSpaceIndex > 0) {
        const nextTokens = current.tokens.slice(lastSpaceIndex + 1)
        current.tokens = current.tokens.slice(0, lastSpaceIndex)
        current.width = current.tokens.reduce((sum, item) => sum + item.width, 0)
        pushLine()
        current.tokens = nextTokens
        current.width = nextTokens.reduce((sum, item) => sum + item.width, 0)
      } else {
        pushLine()
      }
    }

    if (current.tokens.length === 0 && token.type === 'space') continue

    current.tokens.push(token)
    current.width += token.width
  }

  if (current.tokens.length > 0 || lines.length === 0) {
    pushLine()
  }

  return lines
}

export function heightOfRichPdfText(
  document: PDFKit.PDFDocument,
  text: string,
  options: Pick<RichPdfTextOptions, 'emojiScale' | 'font' | 'fontSize' | 'lineGap' | 'width'>
) {
  const lines = wrapRichPdfText(document, text, options)
  const lineGap = options.lineGap ?? 0
  return lines.length * options.fontSize + Math.max(0, lines.length - 1) * lineGap
}

export function renderRichPdfText(
  document: PDFKit.PDFDocument,
  text: string,
  options: RichPdfTextOptions
) {
  const lines = wrapRichPdfText(document, text, options)
  const lineGap = options.lineGap ?? 0
  const emojiSize = options.fontSize * (options.emojiScale ?? 1.08)
  const emojiYOffset = options.fontSize * 0.02

  document.font(options.font).fontSize(options.fontSize).fillColor(options.color)

  lines.forEach((line, lineIndex) => {
    let cursorX = options.x
    const lineY = options.y + lineIndex * (options.fontSize + lineGap)

    line.tokens.forEach((token) => {
      if (token.type === 'emoji' && token.emojiPath) {
        try {
          document.image(token.emojiPath, cursorX, lineY + emojiYOffset, {
            fit: [emojiSize, emojiSize],
          })
        } catch {
          document
            .font(options.font)
            .fontSize(options.fontSize)
            .fillColor(options.color)
            .text(token.text, cursorX, lineY, {
              lineBreak: false,
              width: token.width,
            })
        }
      } else {
        document
          .font(options.font)
          .fontSize(options.fontSize)
          .fillColor(options.color)
          .text(token.text, cursorX, lineY, {
            lineBreak: false,
            width: token.width,
          })
      }

      cursorX += token.width
    })
  })

  document.y = options.y + heightOfRichPdfText(document, text, options)
}
