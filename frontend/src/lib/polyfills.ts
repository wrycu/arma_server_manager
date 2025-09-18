// Polyfills for environments that are not secure contexts (e.g., accessing via IP/hostname)
// Ensure crypto.getRandomValues exists, then provide crypto.randomUUID if missing.
//eslint
function ensureCrypto(): any {
  const g: any = globalThis as any
  if (!g.crypto) {
    g.crypto = {}
  }
  return g.crypto
}

function ensureGetRandomValues(cryptoObj: any): void {
  if (typeof cryptoObj.getRandomValues === 'function') return

  cryptoObj.getRandomValues = (array: Uint8Array): Uint8Array => {
    if (!(array instanceof Uint8Array)) {
      throw new TypeError('Expected Uint8Array for getRandomValues polyfill')
    }
    for (let i = 0; i < array.length; i += 1) {
      array[i] = Math.floor(Math.random() * 256)
    }
    return array
  }
}

function installRandomUUID(cryptoObj: any): void {
  if (typeof cryptoObj.randomUUID === 'function') return

  cryptoObj.randomUUID = (): string => {
    const bytes = cryptoObj.getRandomValues(new Uint8Array(16))
    bytes[6] = (bytes[6] & 0x0f) | 0x40
    bytes[8] = (bytes[8] & 0x3f) | 0x80

    const toHex = (n: number) => n.toString(16).padStart(2, '0')
    return (
      toHex(bytes[0]) +
      toHex(bytes[1]) +
      toHex(bytes[2]) +
      toHex(bytes[3]) +
      '-' +
      toHex(bytes[4]) +
      toHex(bytes[5]) +
      '-' +
      toHex(bytes[6]) +
      toHex(bytes[7]) +
      '-' +
      toHex(bytes[8]) +
      toHex(bytes[9]) +
      '-' +
      toHex(bytes[10]) +
      toHex(bytes[11]) +
      toHex(bytes[12]) +
      toHex(bytes[13]) +
      toHex(bytes[14]) +
      toHex(bytes[15])
    )
  }
}

export function applyPolyfills(): void {
  const cryptoObj = ensureCrypto()
  ensureGetRandomValues(cryptoObj)
  installRandomUUID(cryptoObj)
}

applyPolyfills()
