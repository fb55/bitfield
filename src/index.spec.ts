import BitField from "./index.js";

const data = "011011100110111".split("").map(Number).map(Boolean);

describe("Bitfield", () => {
    describe("constructor", () => {
        it("should be empty when initialized", () => {
            const field = new BitField(data.length);

            for (let index = 0; index < data.length; index++) {
                expect(field.get(index)).toBe(false);
            }
        });

        it("should assume size 0 if no data or size passed in", () => {
            const field = new BitField();
            expect(field.buffer).not.toBeNull();
            expect(field).toHaveLength(0);
        });

        it("should accept a typed array as input", () => {
            const original = new BitField(0, { grow: 100 });
            original.set(15);
            const copy = new BitField(original.buffer);
            expect(copy.get(15)).toBe(true);
        });

        it("correct size bitfield", () => {
            expect(new BitField(1).buffer).toHaveLength(1);
            expect(new BitField(1)).toHaveLength(8);
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
            expect(new BitField(17)).toHaveLength(24);
        });
    });

    describe("`set`", () => {
        it("should reproduce written data", () => {
            const field = new BitField(data.length);

            for (let index = 0; index < data.length; index++) {
                field.set(index, data[index]);
            }

            for (let index = 0; index < data.length; index++) {
                expect(field.get(index)).toBe(data[index]);
            }
        });

        it("out-of-bounds reads should be `false`", () => {
            const field = new BitField(data.length);

            for (let index = data.length; index < 1e3; index++) {
                expect(field.get(index)).toBe(false);
            }
        });

        it("should support disabling a field", () => {
            const field = new BitField(0, { grow: 100 });
            field.set(3, true);
            expect(field.get(3)).toBe(true);
            field.set(3, false);

            // Check the first 10 indices, to ensure we only mutated a single field
            for (let index = 0; index < 10; index++) {
                expect(field.get(index)).toBe(false);
            }

            // Set the first 10 fields, then disable one
            for (let index = 0; index < 10; index++) {
                field.set(index);
            }

            field.set(5, false);
            for (let index = 0; index < 10; index++) {
                expect(field.get(index)).toBe(index !== 5);
            }
        });

        it("should ignore disables out of bounds", () => {
            const field = new BitField(0, { grow: 100 });
            field.set(3, false);
            expect(field.buffer).toHaveLength(0);
        });

        describe("`grow` option", () => {
            it("should not grow by default", () => {
                const field = new BitField(data.length);

                for (let index = 25; index < 125; index++) {
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
                const growField = new BitField(data.length, {
                    grow: Number.POSITIVE_INFINITY,
                });

                for (let index = 25; index < 125; index++) {
                    index += 8 + Math.floor(32 * Math.random());

                    const oldLength = growField.buffer.length;
                    expect(growField.get(index)).toBe(false);
                    // Should not have grown for get()
                    expect(growField.buffer).toHaveLength(oldLength);
                    growField.set(index, true);
                    // Should have grown for set()
                    expect(growField.buffer.length).toBeGreaterThanOrEqual(
                        Math.ceil((index + 1) / 8),
                    );
                    expect(growField.get(index)).toBe(true);
                }
            });

            it("should restrict growth to growth option", () => {
                const smallGrowField = new BitField(0, { grow: 50 });

                for (let index = 0; index < 100; index++) {
                    const oldLength = smallGrowField.buffer.length;
                    smallGrowField.set(index, true);
                    if (index <= 55) {
                        // Should have grown for set()
                        expect(
                            smallGrowField.buffer.length,
                        ).toBeGreaterThanOrEqual((index >> 3) + 1);
                        expect(smallGrowField.get(index)).toBe(true);
                    } else {
                        // Should not have grown for set()
                        expect(smallGrowField.buffer).toHaveLength(oldLength);
                        expect(smallGrowField.get(index)).toBe(false);
                    }
                }
            });
        });
    });

    describe("`setAll`", () => {
        it("should reproduce written data", () => {
            const field = new BitField(data.length);

            field.setAll(data);

            for (let index = 0; index < data.length; index++) {
                expect(field.get(index)).toBe(data[index]);
            }
        });

        it("should support offset", () => {
            const field = new BitField(data.length);

            field.setAll(data, 3);

            for (let index = 0; index < data.length; index++) {
                expect(field.get(index)).toBe(
                    index < 3 ? false : data[index - 3],
                );
            }

            for (let index = data.length + 3; index < 1e3; index++) {
                expect(field.get(index)).toBe(false);
            }
        });

        it("should grow if needed", () => {
            const field = new BitField(data.length, { grow: 100 });

            field.setAll(data, 3);

            for (let index = 0; index < data.length + 3; index++) {
                expect(field.get(index)).toBe(
                    index < 3 ? false : data[index - 3],
                );
            }

            for (let index = data.length + 3; index < 1e3; index++) {
                expect(field.get(index)).toBe(false);
            }
        });
    });

    describe("`forEach`", () => {
        it("should loop through all values", () => {
            const field = new BitField(data.length);
            field.setAll(data);

            const values: boolean[] = [];

            field.forEach((bit, index) => {
                expect(index).toBe(values.length);
                expect(field.get(index)).toBe(bit);
                values.push(bit);
            });

            expect(values).toStrictEqual(
                // Data has 15 entries, append a `false` to make it match.
                [...data, false],
            );
        });

        it("should loop through some of the values", () => {
            const field = new BitField(data.length);
            field.setAll(data);

            const values: boolean[] = [];

            field.forEach(
                (bit, index) => {
                    expect(field.get(index)).toBe(bit);
                    values.push(bit);
                },
                3,
                11,
            );

            expect(values).toStrictEqual(data.slice(3, 11));
        });
    });

    describe("`isEmpty`", () => {
        it("should return true for an empty BitField", () => {
            const field = new BitField(10); // Assuming this creates a BitField with 10 bits, all unset
            expect(field.isEmpty()).toBe(true);
        });

        it("should return false for a BitField with at least one bit set", () => {
            const field = new BitField(10);
            field.set(5); // Set the 6th bit
            expect(field.isEmpty()).toBe(false);
        });

        it("should return true for a BitField with all bits unset after some were set", () => {
            const field = new BitField(10);
            field.set(3);
            field.set(3, false); // Unset the 4th bit
            expect(field.isEmpty()).toBe(true);
        });
    });
});
