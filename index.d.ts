declare class Bitfield {
    constructor(data: number, options: any);
    get(i: number): boolean;
    set(i: number, b: boolean);
    buffer: Buffer | Uint8Array;
}
export = Bitfield;
