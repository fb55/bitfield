declare class Bitfield {
    constructor(data: number, options: any);
    get(i: number): boolean;
    set(i: number, b: boolean);
    buffer: number;
}
export = Bitfield;
