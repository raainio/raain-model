import {expect} from 'chai';
import {CartesianValue, QualityPoint, RainComputationQuality, SpeedMatrix, SpeedMatrixContainer} from '../../src';

describe('QualityPoint Edge Cases', () => {
    it('should handle missing or invalid data in quality points', () => {
        // Test with missing gauge value
        const qualityPointMissingGauge = new QualityPoint({
            gaugeId: 'gauge1',
            gaugeLabel: 'test gauge',
            gaugeDate: new Date(),
            rainDate: new Date(),
            gaugeCartesianValue: null,
            rainCartesianValues: [new CartesianValue({value: 10, lat: 1, lng: 1})],
            speed: {x: 1, y: 1},
            remark: 'missing gauge'
        });

        expect(qualityPointMissingGauge.getGaugeValue()).eq(undefined);
        expect(qualityPointMissingGauge.getRainValue()).eq(10);
        expect(qualityPointMissingGauge.getDelta()).eq(undefined);

        // Test with missing rain values
        const qualityPointMissingRain = new QualityPoint({
            gaugeId: 'gauge1',
            gaugeLabel: 'test gauge',
            gaugeDate: new Date(),
            rainDate: new Date(),
            gaugeCartesianValue: new CartesianValue({value: 10, lat: 1, lng: 1}),
            rainCartesianValues: [],
            speed: {x: 1, y: 1},
            remark: 'missing rain'
        });

        expect(qualityPointMissingRain.getGaugeValue()).eq(10);
        expect(qualityPointMissingRain.getRainValue()).eq(0);
        expect(qualityPointMissingRain.getDelta()).eq(10);

        // Test with null dates
        const qualityPointNullDates = new QualityPoint({
            gaugeId: 'gauge1',
            gaugeLabel: 'test gauge',
            gaugeDate: null,
            rainDate: null,
            gaugeCartesianValue: new CartesianValue({value: 10, lat: 1, lng: 1}),
            rainCartesianValues: [new CartesianValue({value: 10, lat: 1, lng: 1})],
            speed: {x: 1, y: 1},
            remark: 'null dates'
        });

        // Check that dates are set to Unix epoch when constructed with null
        expect(qualityPointNullDates.gaugeDate.getTime()).to.equal(0);
        expect(qualityPointNullDates.rainDate.getTime()).to.equal(0);
        // getTimeDeltaInMinutes should return 0 for equal dates
        expect(qualityPointNullDates.getTimeDeltaInMinutes()).to.equal(0);
    });

    it('should handle extreme value differences between gauge and rain', () => {
        const qualityPointExtreme = new QualityPoint({
            gaugeId: 'gauge1',
            gaugeLabel: 'test gauge',
            gaugeDate: new Date(),
            rainDate: new Date(),
            gaugeCartesianValue: new CartesianValue({value: 1000, lat: 1, lng: 1}),
            rainCartesianValues: [new CartesianValue({value: 1, lat: 1, lng: 1})],
            speed: {x: 1, y: 1},
            remark: 'extreme difference'
        });

        expect(qualityPointExtreme.getGaugeValue()).eq(1000);
        expect(qualityPointExtreme.getRainValue()).eq(1);
        expect(qualityPointExtreme.getDelta()).eq(999);
        expect(qualityPointExtreme.getRatio()).eq(0.001);
    });

    it('should handle multiple rain values with significant variance', () => {
        const qualityPointMultiRain = new QualityPoint({
            gaugeId: 'gauge1',
            gaugeLabel: 'test gauge',
            gaugeDate: new Date(),
            rainDate: new Date(),
            gaugeCartesianValue: new CartesianValue({value: 50, lat: 1, lng: 1}),
            rainCartesianValues: [
                new CartesianValue({value: 10, lat: 1, lng: 1}),
                new CartesianValue({value: 20, lat: 1, lng: 1}),
                new CartesianValue({value: 100, lat: 1, lng: 1})
            ],
            speed: {x: 1, y: 1},
            remark: 'varied rain values'
        });

        expect(qualityPointMultiRain.getRainValue()).to.be.approximately(43.33, 0.01);
        expect(qualityPointMultiRain.getDelta()).to.be.approximately(6.67, 0.01);
    });
});

describe('SpeedMatrix Edge Cases', () => {
    it('should handle empty quality points', () => {
        const speedMatrix = new SpeedMatrix('test', '', []);
        expect(speedMatrix.getQualityPoints().length).eq(0);
        expect(speedMatrix.getMaxRain()).eq(-1);
        expect(speedMatrix.getMaxGauge()).eq(-1);
    });

    it('should handle quality points with extreme speeds', () => {
        const qualityPoint = new QualityPoint({
            gaugeId: 'gauge1',
            gaugeLabel: 'test gauge',
            gaugeDate: new Date(),
            rainDate: new Date(),
            gaugeCartesianValue: new CartesianValue({value: 10, lat: 1, lng: 1}),
            rainCartesianValues: [new CartesianValue({value: 10, lat: 1, lng: 1})],
            speed: {x: 1000, y: 1000}, // Extreme speed
            remark: 'extreme speed'
        });

        const speedMatrix = new SpeedMatrix('test', '', [qualityPoint]);
        expect(speedMatrix.getQualityPoints().length).eq(1);
        expect(SpeedMatrix.ComputeQualityIndicator(speedMatrix.getQualityPoints())).eq(0);
    });
});

describe('SpeedMatrixContainer Quality Tests', () => {
    it('should handle merging of conflicting matrices', () => {
        const date1 = new Date();
        const date2 = new Date(date1.getTime() + 1000); // 1 second later

        const qualityPoint1 = new QualityPoint({
            gaugeId: 'gauge1',
            gaugeLabel: 'test gauge',
            gaugeDate: date1,
            rainDate: date1,
            gaugeCartesianValue: new CartesianValue({value: 10, lat: 1, lng: 1}),
            rainCartesianValues: [new CartesianValue({value: 10, lat: 1, lng: 1})],
            speed: {x: 1, y: 1},
            remark: 'first point'
        });

        const qualityPoint2 = new QualityPoint({
            gaugeId: 'gauge1',
            gaugeLabel: 'test gauge',
            gaugeDate: date2,
            rainDate: date2,
            gaugeCartesianValue: new CartesianValue({value: 20, lat: 1, lng: 1}),
            rainCartesianValues: [new CartesianValue({value: 20, lat: 1, lng: 1})],
            speed: {x: -1, y: -1}, // Opposite direction
            remark: 'second point'
        });

        const matrix1 = new SpeedMatrix('1', '', [qualityPoint1]);
        const matrix2 = new SpeedMatrix('2', '', [qualityPoint2]);

        const container = new SpeedMatrixContainer({matrices: [matrix1]});
        container.merge(new SpeedMatrixContainer({matrices: [matrix2]}));

        // Verify the merge result
        expect(container.getQualityPoints().length).eq(2);
        expect(container.getMaxGauge()).eq(20);
        expect(container.getMaxRain()).eq(20);
    });

    it('should handle boundary conditions', () => {
        const qualityPoint = new QualityPoint({
            gaugeId: 'gauge1',
            gaugeLabel: 'test gauge',
            gaugeDate: new Date(),
            rainDate: new Date(),
            gaugeCartesianValue: new CartesianValue({value: 0, lat: 1, lng: 1}), // Zero gauge value
            rainCartesianValues: [new CartesianValue({value: 0, lat: 1, lng: 1})], // Zero rain value
            speed: {x: 0, y: 0}, // Zero speed
            remark: 'boundary case'
        });

        const container = new SpeedMatrixContainer({matrices: [new SpeedMatrix('test', '', [qualityPoint])]});
        expect(container.getMaxGauge()).eq(0);
        expect(container.getMaxRain()).eq(0);
    });
});

describe('RainComputationQuality Edge Cases', () => {
    it('should handle quality computation with minimal data', () => {
        const rainComputationQuality = new RainComputationQuality({
            id: 'test',
            date: new Date(),
            isReady: true,
            qualitySpeedMatrixContainer: new SpeedMatrixContainer({matrices: []})
        });

        expect(rainComputationQuality.isReady).eq(true);
        expect(rainComputationQuality.qualitySpeedMatrixContainer.getQualityPoints().length).eq(0);
    });

    it('should handle quality computation with inconsistent data', () => {
        const qualityPoint = new QualityPoint({
            gaugeId: 'gauge1',
            gaugeLabel: 'test gauge',
            gaugeDate: new Date(),
            rainDate: new Date(),
            gaugeCartesianValue: new CartesianValue({value: 100, lat: 1, lng: 1}),
            rainCartesianValues: [new CartesianValue({value: 1, lat: 1, lng: 1})], // Very different from gauge
            speed: {x: 1, y: 1},
            remark: 'inconsistent data'
        });

        const container = new SpeedMatrixContainer({matrices: [new SpeedMatrix('test', '', [qualityPoint])]});
        const rainComputationQuality = new RainComputationQuality({
            id: 'test',
            date: new Date(),
            isReady: true,
            qualitySpeedMatrixContainer: container
        });

        expect(rainComputationQuality.isReady).eq(true);
        expect(SpeedMatrix.ComputeQualityIndicator(rainComputationQuality.qualitySpeedMatrixContainer.getQualityPoints())).eq(99);
    });
});
