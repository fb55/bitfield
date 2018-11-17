declare module "bitfield" {
    class Bitfield {
        get(i: number): boolean;
        set(i: number, b: boolean);
    }
    export = Bitfield;
}
