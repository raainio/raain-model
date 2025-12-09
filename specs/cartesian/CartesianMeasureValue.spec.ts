import {expect} from 'chai';
import {CartesianMeasureValue, CartesianValue, MergeStrategy} from '../../src';

describe('CartesianMeasureValue', () => {
    it('should merge duplicate lat/lng by averaging values', () => {
        const values = [
            new CartesianValue({lat: 0, lng: 0, value: 1}),
            new CartesianValue({lat: 0, lng: 0, value: 3}),
            new CartesianValue({lat: 1, lng: 1, value: 10}),
            new CartesianValue({lat: 1, lng: 1, value: 20}),
            new CartesianValue({lat: 2, lng: 2, value: 5}),
        ];

        const cmv = new CartesianMeasureValue({cartesianValues: []});
        cmv.setCartesianValues(values, {mergeStrategy: MergeStrategy.AVERAGE});

        const merged = cmv.getCartesianValues();
        // Should have one per unique coordinate: (0,0), (1,1), (2,2)
        expect(merged.length).to.equal(3);

        const v00 = cmv.getCartesianValue({lat: 0, lng: 0});
        const v11 = cmv.getCartesianValue({lat: 1, lng: 1});
        const v22 = cmv.getCartesianValue({lat: 2, lng: 2});

        expect(v00?.value).to.equal((1 + 3) / 2);
        expect(v11?.value).to.equal((10 + 20) / 2);
        expect(v22?.value).to.equal(5);

        // Check min/max computed from merged set
        const minMax = cmv.getMinMaxValues();
        expect(minMax).to.deep.equal({min: 2, max: 15});
    });

    describe('setCartesianValues with MergeStrategy', () => {
        const createTestValues = () => [
            new CartesianValue({lat: 0, lng: 0, value: 1}),
            new CartesianValue({lat: 0, lng: 0, value: 3}),
            new CartesianValue({lat: 0, lng: 0, value: 5}),
            new CartesianValue({lat: 1, lng: 1, value: 10}),
            new CartesianValue({lat: 1, lng: 1, value: 20}),
            new CartesianValue({lat: 2, lng: 2, value: 7}),
        ];

        it('should not merge duplicates when mergeStrategy is NONE', () => {
            const values = createTestValues();
            const cmv = new CartesianMeasureValue({cartesianValues: []});
            cmv.setCartesianValues(values, {mergeStrategy: MergeStrategy.NONE});

            const result = cmv.getCartesianValues();
            expect(result.length).to.equal(6);

            // All original values should be preserved
            expect(result[0].lat).to.equal(0);
            expect(result[0].lng).to.equal(0);
            expect(result[0].value).to.equal(1);
            expect(result[1].value).to.equal(3);
            expect(result[2].value).to.equal(5);
        });

        it('should not merge duplicates when mergeStrategy is undefined', () => {
            const values = createTestValues();
            const cmv = new CartesianMeasureValue({cartesianValues: []});
            cmv.setCartesianValues(values);

            const result = cmv.getCartesianValues();
            expect(result.length).to.equal(6);
        });

        it('should merge duplicates by AVERAGE when mergeStrategy is AVERAGE', () => {
            const values = createTestValues();
            const cmv = new CartesianMeasureValue({cartesianValues: []});
            cmv.setCartesianValues(values, {mergeStrategy: MergeStrategy.AVERAGE});

            const result = cmv.getCartesianValues();
            expect(result.length).to.equal(3);

            const v00 = cmv.getCartesianValue({lat: 0, lng: 0});
            const v11 = cmv.getCartesianValue({lat: 1, lng: 1});
            const v22 = cmv.getCartesianValue({lat: 2, lng: 2});

            expect(v00?.value).to.equal((1 + 3 + 5) / 3);
            expect(v11?.value).to.equal((10 + 20) / 2);
            expect(v22?.value).to.equal(7);
        });

        it('should merge duplicates by SUM when mergeStrategy is SUM', () => {
            const values = createTestValues();
            const cmv = new CartesianMeasureValue({cartesianValues: []});
            cmv.setCartesianValues(values, {mergeStrategy: MergeStrategy.SUM});

            const result = cmv.getCartesianValues();
            expect(result.length).to.equal(3);

            const v00 = cmv.getCartesianValue({lat: 0, lng: 0});
            const v11 = cmv.getCartesianValue({lat: 1, lng: 1});
            const v22 = cmv.getCartesianValue({lat: 2, lng: 2});

            expect(v00?.value).to.equal(1 + 3 + 5);
            expect(v11?.value).to.equal(10 + 20);
            expect(v22?.value).to.equal(7);
        });

        it('should merge duplicates by MAX when mergeStrategy is MAX', () => {
            const values = createTestValues();
            const cmv = new CartesianMeasureValue({cartesianValues: []});
            cmv.setCartesianValues(values, {mergeStrategy: MergeStrategy.MAX});

            const result = cmv.getCartesianValues();
            expect(result.length).to.equal(3);

            const v00 = cmv.getCartesianValue({lat: 0, lng: 0});
            const v11 = cmv.getCartesianValue({lat: 1, lng: 1});
            const v22 = cmv.getCartesianValue({lat: 2, lng: 2});

            expect(v00?.value).to.equal(5);
            expect(v11?.value).to.equal(20);
            expect(v22?.value).to.equal(7);
        });

        it('should handle null values in input array', () => {
            const values = [
                new CartesianValue({lat: 0, lng: 0, value: 1}),
                null,
                new CartesianValue({lat: 0, lng: 0, value: 3}),
                null,
            ];
            const cmv = new CartesianMeasureValue({cartesianValues: []});
            cmv.setCartesianValues(values, {mergeStrategy: MergeStrategy.SUM});

            const result = cmv.getCartesianValues();
            expect(result.length).to.equal(1);

            const v00 = cmv.getCartesianValue({lat: 0, lng: 0});
            expect(v00?.value).to.equal(4);
        });

        it('should handle empty array', () => {
            const cmv = new CartesianMeasureValue({cartesianValues: []});
            cmv.setCartesianValues([], {mergeStrategy: MergeStrategy.AVERAGE});

            const result = cmv.getCartesianValues();
            expect(result.length).to.equal(0);
        });

        it('should handle single value without duplicates', () => {
            const values = [new CartesianValue({lat: 0, lng: 0, value: 42})];
            const cmv = new CartesianMeasureValue({cartesianValues: []});
            cmv.setCartesianValues(values, {mergeStrategy: MergeStrategy.AVERAGE});

            const result = cmv.getCartesianValues();
            expect(result.length).to.equal(1);

            const v00 = cmv.getCartesianValue({lat: 0, lng: 0});
            expect(v00?.value).to.equal(42);
        });

        it('should correctly compute min/max after merging with SUM strategy', () => {
            const values = createTestValues();
            const cmv = new CartesianMeasureValue({cartesianValues: []});
            cmv.setCartesianValues(values, {mergeStrategy: MergeStrategy.SUM});

            const minMax = cmv.getMinMaxValues();
            expect(minMax).to.deep.equal({min: 7, max: 30});
        });

        it('should correctly compute min/max after merging with MAX strategy', () => {
            const values = createTestValues();
            const cmv = new CartesianMeasureValue({cartesianValues: []});
            cmv.setCartesianValues(values, {mergeStrategy: MergeStrategy.MAX});

            const minMax = cmv.getMinMaxValues();
            expect(minMax).to.deep.equal({min: 5, max: 20});
        });

        it('should truncate values to specified precision', () => {
            const values = [
                new CartesianValue({lat: 0, lng: 0, value: 0.123456}),
                new CartesianValue({lat: 0, lng: 0, value: 0.654321}),
                new CartesianValue({lat: 1, lng: 1, value: 1.999999}),
            ];
            const cmv = new CartesianMeasureValue({cartesianValues: []});
            cmv.setCartesianValues(values, {
                mergeStrategy: MergeStrategy.AVERAGE,
                valuesPrecision: 4,
            });

            const result = cmv.getCartesianValues();
            expect(result.length).to.equal(2);

            const v00 = cmv.getCartesianValue({lat: 0, lng: 0});
            const v11 = cmv.getCartesianValue({lat: 1, lng: 1});

            // (0.123456 + 0.654321) / 2 = 0.388888... truncated to 4 decimals = 0.3888
            expect(v00?.value).to.equal(0.3888);
            // 1.999999 truncated to 4 decimals = 1.9999
            expect(v11?.value).to.equal(1.9999);
        });

        describe('removeNullValues option', () => {
            it('should remove values with value === 0 when removeNullValues is true (AVERAGE)', () => {
                const values = [
                    new CartesianValue({lat: 0, lng: 0, value: 0}),
                    new CartesianValue({lat: 0, lng: 0, value: 0}),
                    new CartesianValue({lat: 1, lng: 1, value: 10}),
                    new CartesianValue({lat: 2, lng: 2, value: 0}),
                ];
                const cmv = new CartesianMeasureValue({cartesianValues: []});
                cmv.setCartesianValues(values, {
                    mergeStrategy: MergeStrategy.AVERAGE,
                    removeNullValues: true,
                });

                const result = cmv.getCartesianValues();
                expect(result.length).to.equal(1);
                expect(cmv.getCartesianValue({lat: 1, lng: 1})?.value).to.equal(10);
                expect(cmv.getCartesianValue({lat: 0, lng: 0})).to.be.null;
                expect(cmv.getCartesianValue({lat: 2, lng: 2})).to.be.null;
            });

            it('should remove values with value === 0 when removeNullValues is true (SUM)', () => {
                const values = [
                    new CartesianValue({lat: 0, lng: 0, value: 0}),
                    new CartesianValue({lat: 1, lng: 1, value: 5}),
                    new CartesianValue({lat: 1, lng: 1, value: 3}),
                    new CartesianValue({lat: 2, lng: 2, value: 0}),
                ];
                const cmv = new CartesianMeasureValue({cartesianValues: []});
                cmv.setCartesianValues(values, {
                    mergeStrategy: MergeStrategy.SUM,
                    removeNullValues: true,
                });

                const result = cmv.getCartesianValues();
                expect(result.length).to.equal(1);
                expect(cmv.getCartesianValue({lat: 1, lng: 1})?.value).to.equal(8);
                expect(cmv.getCartesianValue({lat: 0, lng: 0})).to.be.null;
            });

            it('should remove values with value === 0 when removeNullValues is true (MAX)', () => {
                const values = [
                    new CartesianValue({lat: 0, lng: 0, value: 0}),
                    new CartesianValue({lat: 0, lng: 0, value: 0}),
                    new CartesianValue({lat: 1, lng: 1, value: 0}),
                    new CartesianValue({lat: 1, lng: 1, value: 15}),
                    new CartesianValue({lat: 2, lng: 2, value: 0}),
                ];
                const cmv = new CartesianMeasureValue({cartesianValues: []});
                cmv.setCartesianValues(values, {
                    mergeStrategy: MergeStrategy.MAX,
                    removeNullValues: true,
                });

                const result = cmv.getCartesianValues();
                expect(result.length).to.equal(1);
                expect(cmv.getCartesianValue({lat: 1, lng: 1})?.value).to.equal(15);
                expect(cmv.getCartesianValue({lat: 0, lng: 0})).to.be.null;
            });

            it('should keep values with value === 0 when removeNullValues is false', () => {
                const values = [
                    new CartesianValue({lat: 0, lng: 0, value: 0}),
                    new CartesianValue({lat: 1, lng: 1, value: 10}),
                ];
                const cmv = new CartesianMeasureValue({cartesianValues: []});
                cmv.setCartesianValues(values, {
                    mergeStrategy: MergeStrategy.AVERAGE,
                    removeNullValues: false,
                });

                const result = cmv.getCartesianValues();
                expect(result.length).to.equal(2);
                expect(cmv.getCartesianValue({lat: 0, lng: 0})?.value).to.equal(0);
                expect(cmv.getCartesianValue({lat: 1, lng: 1})?.value).to.equal(10);
            });

            it('should keep values with value === 0 when removeNullValues is undefined', () => {
                const values = [
                    new CartesianValue({lat: 0, lng: 0, value: 0}),
                    new CartesianValue({lat: 1, lng: 1, value: 10}),
                ];
                const cmv = new CartesianMeasureValue({cartesianValues: []});
                cmv.setCartesianValues(values, {mergeStrategy: MergeStrategy.AVERAGE});

                const result = cmv.getCartesianValues();
                expect(result.length).to.equal(2);
                expect(cmv.getCartesianValue({lat: 0, lng: 0})?.value).to.equal(0);
            });

            it('should handle all zero values with removeNullValues true', () => {
                const values = [
                    new CartesianValue({lat: 0, lng: 0, value: 0}),
                    new CartesianValue({lat: 1, lng: 1, value: 0}),
                    new CartesianValue({lat: 2, lng: 2, value: 0}),
                ];
                const cmv = new CartesianMeasureValue({cartesianValues: []});
                cmv.setCartesianValues(values, {
                    mergeStrategy: MergeStrategy.SUM,
                    removeNullValues: true,
                });

                const result = cmv.getCartesianValues();
                expect(result.length).to.equal(0);
            });

            it('should remove values that become 0 after truncation when removeNullValues is true', () => {
                const values = [
                    new CartesianValue({lat: 0, lng: 0, value: 0.0001}),
                    new CartesianValue({lat: 0, lng: 0, value: 0.0002}),
                    new CartesianValue({lat: 1, lng: 1, value: 1.5}),
                ];
                const cmv = new CartesianMeasureValue({cartesianValues: []});
                cmv.setCartesianValues(values, {
                    mergeStrategy: MergeStrategy.AVERAGE,
                    valuesPrecision: 2,
                    removeNullValues: true,
                });

                const result = cmv.getCartesianValues();
                // (0.0001 + 0.0002) / 2 = 0.00015 -> truncated to 2 decimals = 0.00 -> removed
                expect(result.length).to.equal(1);
                expect(cmv.getCartesianValue({lat: 1, lng: 1})?.value).to.equal(1.5);
                expect(cmv.getCartesianValue({lat: 0, lng: 0})).to.be.null;
            });

            it('should keep values that become 0 after truncation when removeNullValues is false', () => {
                const values = [
                    new CartesianValue({lat: 0, lng: 0, value: 0.0001}),
                    new CartesianValue({lat: 0, lng: 0, value: 0.0002}),
                    new CartesianValue({lat: 1, lng: 1, value: 1.5}),
                ];
                const cmv = new CartesianMeasureValue({cartesianValues: []});
                cmv.setCartesianValues(values, {
                    mergeStrategy: MergeStrategy.AVERAGE,
                    valuesPrecision: 2,
                    removeNullValues: false,
                });

                const result = cmv.getCartesianValues();
                // (0.0001 + 0.0002) / 2 = 0.00015 -> truncated to 2 decimals = 0.00 -> kept
                expect(result.length).to.equal(2);
                expect(cmv.getCartesianValue({lat: 1, lng: 1})?.value).to.equal(1.5);
                expect(cmv.getCartesianValue({lat: 0, lng: 0})?.value).to.equal(0);
            });
        });
    });
});
