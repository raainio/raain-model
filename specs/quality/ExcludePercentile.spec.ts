import {expect} from 'chai';
import {CartesianValue, QualityIndicatorMethod, QualityPoint, SpeedMatrix} from '../../src';

describe('ExcludePercentile', () => {
    const createPoint = (
        gaugeValue: number,
        rainValue: number,
        gaugeId = 'gauge1'
    ): QualityPoint => {
        return new QualityPoint({
            gaugeId,
            gaugeLabel: 'test',
            gaugeDate: new Date(),
            rainDate: new Date(),
            gaugeCartesianValue: new CartesianValue({value: gaugeValue, lat: 1, lng: 1}),
            rainCartesianValues: [new CartesianValue({value: rainValue, lat: 1, lng: 1})],
            speed: {x: 0, y: 0},
            remark: '',
        });
    };

    it('should not filter when excludePercentile is 0', () => {
        const points = [
            createPoint(10, 10),
            createPoint(20, 20),
            createPoint(30, 50), // outlier: delta=20
        ];

        const withoutExclusion = SpeedMatrix.ComputeQualityIndicator(points, {
            method: QualityIndicatorMethod.DELTA,
            normalize: false,
            excludePercentile: 0,
        });
        const withoutOption = SpeedMatrix.ComputeQualityIndicator(points, {
            method: QualityIndicatorMethod.DELTA,
            normalize: false,
        });
        expect(withoutExclusion).to.equal(withoutOption);
    });

    it('should exclude top outliers by delta', () => {
        const points = [
            createPoint(10, 10, 'g1'), // delta=0
            createPoint(20, 21, 'g2'), // delta=1
            createPoint(30, 32, 'g3'), // delta=2
            createPoint(40, 50, 'g4'), // delta=10 (outlier)
        ];

        // Without exclusion: mean delta = (0+1+2+10)/4 = 3.25
        const without = SpeedMatrix.ComputeQualityIndicator(points, {
            method: QualityIndicatorMethod.DELTA,
            normalize: false,
        });
        expect(without).to.equal(3.25);

        // Exclude top 25% (1 out of 4 points removed = the delta=10 outlier)
        const with25 = SpeedMatrix.ComputeQualityIndicator(points, {
            method: QualityIndicatorMethod.DELTA,
            normalize: false,
            excludePercentile: 25,
        });
        // Remaining: delta 0, 1, 2 → mean = 1
        expect(with25).to.equal(1);
    });

    it('should work with all quality methods', () => {
        const points = [
            createPoint(10, 10, 'g1'),
            createPoint(20, 21, 'g2'),
            createPoint(30, 32, 'g3'),
            createPoint(40, 50, 'g4'), // outlier
        ];

        const methods = [
            QualityIndicatorMethod.DELTA,
            QualityIndicatorMethod.RMSE,
            QualityIndicatorMethod.KLING_GUPTA,
            QualityIndicatorMethod.NASH_SUTCLIFFE,
            QualityIndicatorMethod.RATIO,
            QualityIndicatorMethod.MAPE,
            QualityIndicatorMethod.SUCCESS_RATE,
        ];

        for (const method of methods) {
            const without = SpeedMatrix.ComputeQualityIndicator(points, {
                method,
                normalize: false,
            });
            const withExclusion = SpeedMatrix.ComputeQualityIndicator(points, {
                method,
                normalize: false,
                excludePercentile: 25,
            });
            // Excluding the outlier should improve quality for all methods
            // For methods where lower is better (DELTA, RMSE, MAPE): withExclusion < without
            // For methods where higher is better (KGE, NSE, RATIO, SUCCESS_RATE): withExclusion > without
            expect(withExclusion).to.not.equal(without, `${method} should differ with exclusion`);
        }
    });

    it('should keep at least 1 point even with high percentile', () => {
        const points = [
            createPoint(10, 20, 'g1'), // delta=10
            createPoint(30, 50, 'g2'), // delta=20
        ];

        // 99% exclusion should still keep at least 1 point
        const result = SpeedMatrix.ComputeQualityIndicator(points, {
            method: QualityIndicatorMethod.DELTA,
            normalize: false,
            excludePercentile: 99,
        });
        // Keeps the closest point (delta=10)
        expect(result).to.equal(10);
    });

    it('should not filter with excludePercentile >= 100', () => {
        const points = [createPoint(10, 20, 'g1')];

        const without = SpeedMatrix.ComputeQualityIndicator(points, {
            method: QualityIndicatorMethod.DELTA,
            normalize: false,
        });
        const with100 = SpeedMatrix.ComputeQualityIndicator(points, {
            method: QualityIndicatorMethod.DELTA,
            normalize: false,
            excludePercentile: 100,
        });
        expect(with100).to.equal(without);
    });

    it('should handle empty points array', () => {
        const result = SpeedMatrix.ComputeQualityIndicator([], {
            method: QualityIndicatorMethod.DELTA,
            normalize: false,
            excludePercentile: 10,
        });
        expect(result).to.equal(0);
    });

    it('should work with normalized output', () => {
        const points = [
            createPoint(10, 10, 'g1'),
            createPoint(20, 21, 'g2'),
            createPoint(30, 32, 'g3'),
            createPoint(40, 50, 'g4'), // outlier
        ];

        const without = SpeedMatrix.ComputeQualityIndicator(points, {
            method: QualityIndicatorMethod.KLING_GUPTA,
            normalize: true,
            excludePercentile: 0,
        });
        const with25 = SpeedMatrix.ComputeQualityIndicator(points, {
            method: QualityIndicatorMethod.KLING_GUPTA,
            normalize: true,
            excludePercentile: 25,
        });
        // Excluding outlier should improve KGE (higher = better)
        expect(with25).to.be.greaterThan(without);
    });
});
