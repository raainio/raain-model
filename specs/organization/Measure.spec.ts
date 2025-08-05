import {expect} from 'chai';
import {
    CartesianMeasureValue,
    CartesianValue,
    ICartesianMeasureValue,
    IPolarMeasureValue,
    Measure,
    MeasureValuePolarContainer,
    PolarMeasureValue,
} from '../../src';

describe('Measure', () => {
    describe('getMinMaxValues', () => {
        it('should return min and max for number[] values', () => {
            const measure = new Measure({
                id: 'test',
                values: [1, 5, 3, 10, 2],
            });

            const result = measure.getMinMaxValues();
            expect(result).to.not.be.null;
            expect(result.min).to.equal(1);
            expect(result.max).to.equal(10);
        });

        it('should return min and max for IPolarMeasureValue[] values', () => {
            // Create a PolarMeasureValue with known values
            const container = new MeasureValuePolarContainer({
                azimuth: 0,
                distance: 1000,
                polarEdges: [5, 10, 15, 20, 2],
            });

            const polarMeasureValue = new PolarMeasureValue({
                measureValuePolarContainers: [container],
            });

            const measure = new Measure({
                id: 'test',
                values: [polarMeasureValue],
            });

            const result = measure.getMinMaxValues();
            expect(result).to.not.be.null;
            expect(result.min).to.equal(2);
            expect(result.max).to.equal(20);
        });

        it('should return min and max for ICartesianMeasureValue[] values', () => {
            // Create a CartesianMeasureValue with known values
            const cartesianValue1 = new CartesianValue({
                lat: 10,
                lng: 20,
                value: 5,
            });

            const cartesianValue2 = new CartesianValue({
                lat: 11,
                lng: 21,
                value: 15,
            });

            const cartesianValue3 = new CartesianValue({
                lat: 12,
                lng: 22,
                value: 3,
            });

            const cartesianMeasureValue = new CartesianMeasureValue({
                cartesianValues: [cartesianValue1, cartesianValue2, cartesianValue3],
            });

            const measure = new Measure({
                id: 'test',
                values: [cartesianMeasureValue],
            });

            const result = measure.getMinMaxValues();
            expect(result).to.not.be.null;
            expect(result.min).to.equal(3);
            expect(result.max).to.equal(15);
        });

        it('should return null for empty values array', () => {
            const measure = new Measure({
                id: 'test',
                values: [],
            });

            const result = measure.getMinMaxValues();
            expect(result).to.be.null;
        });
    });
});
