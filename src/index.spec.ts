import BitField from "./index.js";

const data = "011011100110111".split("").map(Number).map(Boolean);

describe("Bitfield", () => {
    it("should be empty when initialized", () => {
        const field = new BitField(data.length);

        for (let i = 0; i < data.length; i++) {
            expect(field.get(i)).toBe(false);
        }
    });

    // Write data
    it("should reproduce written data", () => {
        const field = new BitField(data.length);

        for (let i = 0; i < data.length; i++) {
            field.set(i, data[i]);
        }

        for (let i = 0; i < data.length; i++) {
            expect(field.get(i)).toBe(data[i]);
        }
    });

    it("out-of-bounds should simply be false", () => {
        const field = new BitField(data.length);

        for (let i = data.length; i < 1e3; i++) {
            expect(field.get(i)).toBe(false);
        }
    });

    it("should not grow by default", () => {
        const field = new BitField(data.length);
        let index = 25;

        for (let i = 0; i < 100; i++) {
            index += 8 + Math.floor(32 * Math.random());

            const oldLength = field.buffer.length;
            expect(field.get(index)).toBe(false);

            // Should not have grown for get()
            expect(field.buffer).toHaveLength(oldLength);

            field.set(index, true);

            // Should not have grown for set()
            expect(field.buffer).toHaveLength(oldLength);
            expect(field.get(index)).toBe(false);
        }
    });

    it("should be able to grow to infinity", () => {
        const growField = new BitField(data.length, { grow: Infinity });
        let index = 25;

        for (let i = 0; i < 100; i++) {
            index += 8 + Math.floor(32 * Math.random());

            const oldLength = growField.buffer.length;
            expect(growField.get(index)).toBe(false);
            // Should not have grown for get()
            expect(growField.buffer).toHaveLength(oldLength);
            growField.set(index, true);
            // Should have grown for set()
            expect(growField.buffer.length).toBeGreaterThanOrEqual(
                Math.ceil((index + 1) / 8)
            ),
                expect(growField.get(index)).toBe(true);
        }
    });

    it("should restrict growth to growth option", () => {
        const smallGrowField = new BitField(0, { grow: 50 });

        for (let i = 0; i < 100; i++) {
            const oldLength = smallGrowField.buffer.length;
            smallGrowField.set(i, true);
            if (i <= 55) {
                // Should have grown for set()
                expect(smallGrowField.buffer.length).toBeGreaterThanOrEqual(
                    (i >> 3) + 1
                );
                expect(smallGrowField.get(i)).toBe(true);
            } else {
                // Should not have grown for set()
                expect(smallGrowField.buffer).toHaveLength(oldLength);
                expect(smallGrowField.get(i)).toBe(false);
            }
        }
    });

    it("should assume size 0 if no data or size passed in", () => {
        const field2 = new BitField();
        expect(field2.buffer).not.toBeNull();
    });

    it("should accept a typed array as input", () => {
        const original = new BitField(0, { grow: 100 });
        original.set(15);
        const copy = new BitField(original.buffer);
        expect(copy.get(15)).toBe(true);
    });

    it("should support disabling a field", () => {
        const field = new BitField(0, { grow: 100 });
        field.set(3, true);
        expect(field.get(3)).toBe(true);
        field.set(3, false);

        // Check the first 10 indices, to ensure we only mutated a single field
        for (let i = 0; i < 10; i++) {
            expect(field.get(i)).toBe(false);
        }

        // Set the first 10 fields, then disable one
        for (let i = 0; i < 10; i++) {
            field.set(i);
        }

        field.set(5, false);
        for (let i = 0; i < 10; i++) {
            expect(field.get(i)).toBe(i !== 5);
        }
    });

    it("should ignore disables out of bounds", () => {
        const field = new BitField(0, { grow: 100 });
        field.set(3, false);
        expect(field.buffer).toHaveLength(0);
    });

    it("correct size bitfield", () => {
        expect(new BitField(1).buffer).toHaveLength(1);
        expect(new BitField(2).buffer).toHaveLength(1);
        expect(new BitField(3).buffer).toHaveLength(1);
        expect(new BitField(4).buffer).toHaveLength(1);
        expect(new BitField(5).buffer).toHaveLength(1);
        expect(new BitField(6).buffer).toHaveLength(1);
        expect(new BitField(7).buffer).toHaveLength(1);
        expect(new BitField(8).buffer).toHaveLength(1);
        expect(new BitField(9).buffer).toHaveLength(2);
        expect(new BitField(10).buffer).toHaveLength(2);
        expect(new BitField(11).buffer).toHaveLength(2);
        expect(new BitField(12).buffer).toHaveLength(2);
        expect(new BitField(13).buffer).toHaveLength(2);
        expect(new BitField(14).buffer).toHaveLength(2);
        expect(new BitField(15).buffer).toHaveLength(2);
        expect(new BitField(16).buffer).toHaveLength(2);
        expect(new BitField(17).buffer).toHaveLength(3);
    });

    it("should loop through all values", () => {
        const field = new BitField(data.length);

        for (let i = 0; i < data.length; i++) {
            field.set(i, data[i]);
        }

        const values: boolean[] = [];

        field.forEach((bit, index) => {
            expect(index).toBe(values.length);
            expect(field.get(index)).toBe(bit);
            values.push(bit);
        });

        expect(values).toStrictEqual(
            // Data has 15 entries, append a `false` to make it match.
            [...data, false]
        );
    });

    it("should loop through some of the values", () => {
        const field = new BitField(data.length);

        for (let i = 0; i < data.length; i++) {
            field.set(i, data[i]);
        }

        const values: boolean[] = [];

        field.forEach(
            (bit, index) => {
                expect(field.get(index)).toBe(bit);
                values.push(bit);
            },
            3,
            11
        );

        expect(values).toStrictEqual(data.slice(3, 11));
    });
});
