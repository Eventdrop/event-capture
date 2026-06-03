type ZipEntry = {
  data: Uint8Array
  modifiedAt?: Date
  name: string
}

const textEncoder = new TextEncoder()

let crcTable: Uint32Array | null = null

function getCrcTable() {
  if (crcTable) return crcTable

  const table = new Uint32Array(256)

  for (let index = 0; index < 256; index += 1) {
    let value = index

    for (let bit = 0; bit < 8; bit += 1) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1
    }

    table[index] = value >>> 0
  }

  crcTable = table
  return table
}

function crc32(data: Uint8Array) {
  const table = getCrcTable()
  let crc = 0xffffffff

  for (const byte of data) {
    crc = table[(crc ^ byte) & 0xff] ^ (crc >>> 8)
  }

  return (crc ^ 0xffffffff) >>> 0
}

function dosDateTime(date = new Date()) {
  const year = Math.max(1980, date.getFullYear())
  const dosTime =
    (date.getHours() << 11) |
    (date.getMinutes() << 5) |
    Math.floor(date.getSeconds() / 2)
  const dosDate =
    ((year - 1980) << 9) |
    ((date.getMonth() + 1) << 5) |
    date.getDate()

  return { dosDate, dosTime }
}

function writeUint16(view: DataView, offset: number, value: number) {
  view.setUint16(offset, value, true)
}

function writeUint32(view: DataView, offset: number, value: number) {
  view.setUint32(offset, value >>> 0, true)
}

function makeHeader(size: number) {
  const bytes = new Uint8Array(size)
  return {
    bytes,
    view: new DataView(bytes.buffer),
  }
}

function localFileHeader(entry: ZipEntry, crc: number) {
  const fileName = textEncoder.encode(entry.name)
  const { dosDate, dosTime } = dosDateTime(entry.modifiedAt)
  const { bytes, view } = makeHeader(30 + fileName.length)

  writeUint32(view, 0, 0x04034b50)
  writeUint16(view, 4, 20)
  writeUint16(view, 6, 0x0800)
  writeUint16(view, 8, 0)
  writeUint16(view, 10, dosTime)
  writeUint16(view, 12, dosDate)
  writeUint32(view, 14, crc)
  writeUint32(view, 18, entry.data.byteLength)
  writeUint32(view, 22, entry.data.byteLength)
  writeUint16(view, 26, fileName.length)
  writeUint16(view, 28, 0)
  bytes.set(fileName, 30)

  return bytes
}

function centralDirectoryHeader(entry: ZipEntry, crc: number, offset: number) {
  const fileName = textEncoder.encode(entry.name)
  const { dosDate, dosTime } = dosDateTime(entry.modifiedAt)
  const { bytes, view } = makeHeader(46 + fileName.length)

  writeUint32(view, 0, 0x02014b50)
  writeUint16(view, 4, 20)
  writeUint16(view, 6, 20)
  writeUint16(view, 8, 0x0800)
  writeUint16(view, 10, 0)
  writeUint16(view, 12, dosTime)
  writeUint16(view, 14, dosDate)
  writeUint32(view, 16, crc)
  writeUint32(view, 20, entry.data.byteLength)
  writeUint32(view, 24, entry.data.byteLength)
  writeUint16(view, 28, fileName.length)
  writeUint16(view, 30, 0)
  writeUint16(view, 32, 0)
  writeUint16(view, 34, 0)
  writeUint16(view, 36, 0)
  writeUint32(view, 38, 0)
  writeUint32(view, 42, offset)
  bytes.set(fileName, 46)

  return bytes
}

function endOfCentralDirectory(entryCount: number, centralSize: number, centralOffset: number) {
  const { bytes, view } = makeHeader(22)

  writeUint32(view, 0, 0x06054b50)
  writeUint16(view, 4, 0)
  writeUint16(view, 6, 0)
  writeUint16(view, 8, entryCount)
  writeUint16(view, 10, entryCount)
  writeUint32(view, 12, centralSize)
  writeUint32(view, 16, centralOffset)
  writeUint16(view, 20, 0)

  return bytes
}

function safeFileNamePart(value: string) {
  return value
    .trim()
    .replace(/[\\/:*?"<>|]+/g, '-')
    .replace(/\s+/g, ' ')
    .replace(/^\.+|\.+$/g, '')
    .slice(0, 160)
}

export function safeZipFileName(value: string, fallback = 'eventdrop') {
  return safeFileNamePart(value) || fallback
}

export function uniqueZipEntryName(name: string, usedNames: Set<string>) {
  const safeName = safeZipFileName(name, 'photo.jpg')

  if (!usedNames.has(safeName)) {
    usedNames.add(safeName)
    return safeName
  }

  const dotIndex = safeName.lastIndexOf('.')
  const base = dotIndex > 0 ? safeName.slice(0, dotIndex) : safeName
  const extension = dotIndex > 0 ? safeName.slice(dotIndex) : ''
  let counter = 2

  while (usedNames.has(`${base}-${counter}${extension}`)) {
    counter += 1
  }

  const nextName = `${base}-${counter}${extension}`
  usedNames.add(nextName)
  return nextName
}

export function createZipStream(entries: AsyncIterable<ZipEntry>) {
  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const centralDirectory: Uint8Array[] = []
      let offset = 0
      let entryCount = 0

      try {
        for await (const entry of entries) {
          const crc = crc32(entry.data)
          const localHeader = localFileHeader(entry, crc)
          const centralHeader = centralDirectoryHeader(entry, crc, offset)

          controller.enqueue(localHeader)
          controller.enqueue(entry.data)

          centralDirectory.push(centralHeader)
          offset += localHeader.byteLength + entry.data.byteLength
          entryCount += 1
        }

        const centralOffset = offset
        let centralSize = 0

        for (const header of centralDirectory) {
          controller.enqueue(header)
          centralSize += header.byteLength
        }

        controller.enqueue(
          endOfCentralDirectory(entryCount, centralSize, centralOffset)
        )
        controller.close()
      } catch (error) {
        controller.error(error)
      }
    },
  })
}
