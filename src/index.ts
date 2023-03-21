function getByteSize(num: number): number {
    let out = num >> 3;
    if (num % 8 !== 0) out++;
    return out;
}

interface BitFieldOptions {
    /**
     * If you `set` an index that is out-of-bounds, the bitfield
     * will automatically grow so that the bitfield is big enough
     * to contain the given index, up to the given size (in bit).
     *
     * If you want the Bitfield to grow indefinitely, pass `Infinity`.
     *
     * @default 0.
     */
    grow?: number;
}

export default class BitField {
    private readonly grow: number;
    public buffer: Uint8Array;

    constructor(data: number | Uint8Array = 0, opts?: BitFieldOptions) {
        const grow = opts?.grow;
        const byteSize = (grow && isFinite(grow) && getByteSize(grow)) || grow || 0;
        this.grow = byteSize;
        this.buffer =
            typeof data === "number" ? new Uint8Array(getByteSize(data)) : data;
    }

    get(i: number): boolean {
        const j = i >> 3;
        return j < this.buffer.length && !!(this.buffer[j] & (128 >> i % 8));
    }

    set(i: number, value = true): void {
        const j = i >> 3;
        if (value) {
            if (this.buffer.length < j + 1) {
                const length = Math.max(
                    j + 1,
                    Math.min(2 * this.buffer.length, this.grow)
                );
                if (length <= this.grow) {
                    const newBuffer = new Uint8Array(length);
                    newBuffer.set(this.buffer);
                    this.buffer = newBuffer;
                }
            }
            this.buffer[j] |= 128 >> i % 8;
        } else if (j < this.buffer.length) {
            this.buffer[j] &= ~(128 >> i % 8);
        }
    }

    forEach(
        fn: (bit: boolean, index: number) => void,
        start = 0,
        end = this.buffer.length * 8
    ): void {
        for (let i = start; i < end; ) {
            const j = i >> 3;
            const byte = this.buffer[j];
            for (let y = 128, bitIndex = i % 8; y && bitIndex < 8; y >>= 1, bitIndex++, i++) {
                fn(!!(byte & y), i);
            }
        }
    }
}
