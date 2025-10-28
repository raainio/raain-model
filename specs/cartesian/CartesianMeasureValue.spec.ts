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
    });
});
