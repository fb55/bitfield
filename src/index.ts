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
    /**
     * Grow the bitfield up to this number of entries.
     * @default 0.
     */
    private readonly grow: number;
    /** The internal storage of the bitfield. */
    public buffer: Uint8Array;

    /**
     *
     *
     * @param data Either a number representing the maximum number of supported bytes, or a Uint8Array.
     * @param opts Options for the bitfield.
     */
    constructor(data: number | Uint8Array = 0, opts?: BitFieldOptions) {
        const grow = opts?.grow;
        this.grow = (grow && isFinite(grow) && getByteSize(grow)) || grow || 0;
        this.buffer =
            typeof data === "number" ? new Uint8Array(getByteSize(data)) : data;
    }

    /**
     * Get a particular bit.
     *
     * @param i Bit index to retrieve.
     * @returns A boolean indicating whether the `i`th bit is set.
     */
    get(i: number): boolean {
        const j = i >> 3;
        return j < this.buffer.length && !!(this.buffer[j] & (128 >> i % 8));
    }

    /**
     * Set a particular bit.
     *
     * Will grow the underlying array if the bit is out of bounds and the `grow` option is set.
     *
     * @param i Bit index to set.
     * @param value Value to set the bit to. Defaults to `true`.
     */
    set(i: number, value = true): void {
        const j = i >> 3;
    
        // Check if the buffer should be grown
        if (this.grow && j + 1 > this.buffer.length) {
            const length = Math.max(
                j + 1,
                Math.min(2 * this.buffer.length, this.grow)
            );
    
            // Grow the buffer only if the new length is less than or equal to the grow option
            if (length <= this.grow) {
                const newBuffer = new Uint8Array(length);
                newBuffer.set(this.buffer);
                this.buffer = newBuffer;
            }
        }
    
        // Set the bit only if the value is true and the index is within bounds
        if (value && j < this.buffer.length) {
            this.buffer[j] |= 128 >> i % 8;
        }
    }
    

    /**
     * Loop through the bits in the bitfield.
     *
     * @param fn Function to be called with the bit value and index.
     * @param start Index of the first bit to look at.
     * @param end Index of the first bit that should no longer be considered.
     */
    forEach(
        fn: (bit: boolean, index: number) => void,
        start = 0,
        end = this.buffer.length * 8
    ): void {
        for (
            let i = start, j = i >> 3, y = 128 >> i % 8, byte = this.buffer[j];
            i < end;
            i++
        ) {
            fn(!!(byte & y), i);

            y = y === 1 ? ((byte = this.buffer[++j]), 128) : y >> 1;
        }
    }
}
