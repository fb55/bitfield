function getByteSize (num) {
  let out = num >> 3
  if (num % 8 !== 0) out++
  return out
}

class BitField {
  constructor (data = 0, opts) {
    const grow = opts != null && opts.grow
    this.grow = (grow && isFinite(grow) && getByteSize(grow)) || grow || 0
    this.buffer = typeof data === 'number' ? new Uint8Array(getByteSize(data)) : data
  }

  get (i) {
    const j = i >> 3
    return (j < this.buffer.length) &&
      !!(this.buffer[j] & (128 >> (i % 8)))
  }

  set (i, b = true) {
    const j = i >> 3
    if (b) {
      if (this.buffer.length < j + 1) {
        const length = Math.max(j + 1, Math.min(2 * this.buffer.length, this.grow))
        if (length <= this.grow) {
          const newBuffer = new Uint8Array(length)
          newBuffer.set(this.buffer)
          this.buffer = newBuffer
        }
      }
      // Set
      this.buffer[j] |= 128 >> (i % 8)
    } else if (j < this.buffer.length) {
      // Clear
      this.buffer[j] &= ~(128 >> (i % 8))
    }
  }
}

if (typeof module !== 'undefined') module.exports = BitField
