import {expect} from 'chai';
import {
    CartesianValue,
    QualityIndicatorMethod,
    QualityPoint,
    SpeedMatrix,
    QUALITY_NORMALIZATION_DEFAULTS,
} from '../../src';

describe('QualityIndicatorMethod', () => {
    // Helper to create QualityPoint with gauge and rain values
    const createPoint = (gaugeValue: number, rainValue: number): QualityPoint => {
        return new QualityPoint({
            gaugeId: 'gauge1',
            gaugeLabel: 'test',
            gaugeDate: new Date(),
            rainDate: new Date(),
            gaugeCartesianValue: new CartesianValue({value: gaugeValue, lat: 1, lng: 1}),
            rainCartesianValues: [new CartesianValue({value: rainValue, lat: 1, lng: 1})],
            speed: {x: 0, y: 0},
            remark: '',
        });
    };

    describe('DELTA method', () => {
        it('should return 0 for perfect predictions', () => {
            const points = [createPoint(10, 10), createPoint(20, 20), createPoint(30, 30)];

            const indicator = SpeedMatrix.ComputeQualityIndicator(points, {
                method: QualityIndicatorMethod.DELTA,
            });
            expect(indicator).to.equal(0);
        });

        it('should return average absolute difference', () => {
            const points = [
                createPoint(10, 12), // delta = 2
                createPoint(20, 18), // delta = 2
                createPoint(30, 28), // delta = 2
            ];

            const indicator = SpeedMatrix.ComputeQualityIndicator(points, {
                method: QualityIndicatorMethod.DELTA,
            });
            expect(indicator).to.equal(2);
        });

        it('should handle mixed errors', () => {
            const points = [
                createPoint(10, 15), // delta = 5
                createPoint(20, 20), // delta = 0
                createPoint(30, 25), // delta = 5
            ];

            const indicator = SpeedMatrix.ComputeQualityIndicator(points, {
                method: QualityIndicatorMethod.DELTA,
            });
            expect(indicator).to.be.approximately(3.33, 0.01);
        });

        it('should return 0 for empty points', () => {
            const indicator = SpeedMatrix.ComputeQualityIndicator([], {
                method: QualityIndicatorMethod.DELTA,
            });
            expect(indicator).to.equal(0);
        });
    });

    describe('RATIO method', () => {
        it('should return 1 for perfect predictions', () => {
            const points = [createPoint(10, 10), createPoint(20, 20), createPoint(30, 30)];

            const indicator = SpeedMatrix.ComputeQualityIndicator(points, {
                method: QualityIndicatorMethod.RATIO,
            });
            expect(indicator).to.equal(1);
        });

        it('should return average ratio', () => {
            const points = [
                createPoint(100, 50), // ratio = 50/100 = 0.5
                createPoint(100, 100), // ratio = 1
            ];

            const indicator = SpeedMatrix.ComputeQualityIndicator(points, {
                method: QualityIndicatorMethod.RATIO,
            });
            expect(indicator).to.equal(0.75);
        });

        it('should handle rain > gauge', () => {
            const points = [
                createPoint(50, 100), // ratio = 50/100 = 0.5
            ];

            const indicator = SpeedMatrix.ComputeQualityIndicator(points, {
                method: QualityIndicatorMethod.RATIO,
            });
            expect(indicator).to.equal(0.5);
        });

        it('should skip both-zero points', () => {
            const points = [
                createPoint(0, 0), // skipped
                createPoint(100, 100), // ratio = 1
            ];

            const indicator = SpeedMatrix.ComputeQualityIndicator(points, {
                method: QualityIndicatorMethod.RATIO,
            });
            expect(indicator).to.equal(1);
        });

        it('should return 0 when rain is 0 but gauge is not', () => {
            const points = [createPoint(100, 0)];

            const indicator = SpeedMatrix.ComputeQualityIndicator(points, {
                method: QualityIndicatorMethod.RATIO,
            });
            expect(indicator).to.equal(0);
        });
    });

    describe('SUCCESS_RATE method', () => {
        it('should return 100 for all perfect predictions', () => {
            const points = [createPoint(10, 10), createPoint(20, 20)];

            const indicator = SpeedMatrix.ComputeQualityIndicator(points, {
                method: QualityIndicatorMethod.SUCCESS_RATE,
            });
            expect(indicator).to.equal(100);
        });

        it('should calculate percentage of successful predictions', () => {
            const points = [
                createPoint(100, 100), // ratio = 1 >= 0.8 => success
                createPoint(100, 90), // ratio = 0.9 >= 0.8 => success
                createPoint(100, 50), // ratio = 0.5 < 0.8 => fail
                createPoint(100, 30), // ratio = 0.3 < 0.8 => fail
            ];

            const indicator = SpeedMatrix.ComputeQualityIndicator(points, {
                method: QualityIndicatorMethod.SUCCESS_RATE,
            });
            expect(indicator).to.equal(50); // 2/4 = 50%
        });

        it('should use custom threshold', () => {
            const points = [
                createPoint(100, 100), // ratio = 1 >= 0.5 => success
                createPoint(100, 60), // ratio = 0.6 >= 0.5 => success
                createPoint(100, 40), // ratio = 0.4 < 0.5 => fail
            ];

            const indicator = SpeedMatrix.ComputeQualityIndicator(points, {
                method: QualityIndicatorMethod.SUCCESS_RATE,
                successThreshold: 0.5,
            });
            expect(indicator).to.be.approximately(66.67, 0.01);
        });

        it('should count both-zero as success', () => {
            const points = [
                createPoint(0, 0), // both zero => success (correct "no rain" prediction)
                createPoint(100, 100), // ratio = 1 => success
            ];

            const indicator = SpeedMatrix.ComputeQualityIndicator(points, {
                method: QualityIndicatorMethod.SUCCESS_RATE,
            });
            expect(indicator).to.equal(100);
        });
    });

    describe('RMSE method', () => {
        it('should return 0 for perfect predictions', () => {
            const points = [createPoint(10, 10), createPoint(20, 20)];

            const indicator = SpeedMatrix.ComputeQualityIndicator(points, {
                method: QualityIndicatorMethod.RMSE,
            });
            expect(indicator).to.equal(0);
        });

        it('should calculate root mean square error', () => {
            const points = [
                createPoint(10, 12), // error² = 4
                createPoint(20, 18), // error² = 4
                createPoint(30, 28), // error² = 4
            ];
            // RMSE = sqrt((4+4+4)/3) = sqrt(4) = 2

            const indicator = SpeedMatrix.ComputeQualityIndicator(points, {
                method: QualityIndicatorMethod.RMSE,
            });
            expect(indicator).to.equal(2);
        });

        it('should penalize large errors more than small ones', () => {
            // Same total error, different distribution
            const uniformErrors = [
                createPoint(10, 12), // error = 2
                createPoint(20, 22), // error = 2
            ];
            const onelargeError = [
                createPoint(10, 10), // error = 0
                createPoint(20, 24), // error = 4
            ];

            const rmseUniform = SpeedMatrix.ComputeQualityIndicator(uniformErrors, {
                method: QualityIndicatorMethod.RMSE,
            });
            const rmseLarge = SpeedMatrix.ComputeQualityIndicator(onelargeError, {
                method: QualityIndicatorMethod.RMSE,
            });

            // sqrt((4+4)/2) = 2 vs sqrt((0+16)/2) = sqrt(8) ≈ 2.83
            expect(rmseUniform).to.equal(2);
            expect(rmseLarge).to.be.approximately(2.83, 0.01);
            expect(rmseLarge).to.be.greaterThan(rmseUniform);
        });
    });

    describe('MAPE method', () => {
        it('should return 0 for perfect predictions', () => {
            const points = [createPoint(10, 10), createPoint(20, 20)];

            const indicator = SpeedMatrix.ComputeQualityIndicator(points, {
                method: QualityIndicatorMethod.MAPE,
            });
            expect(indicator).to.equal(0);
        });

        it('should calculate mean absolute percentage error', () => {
            const points = [
                createPoint(100, 110), // |110-100|/100 = 10%
                createPoint(100, 90), // |90-100|/100 = 10%
            ];

            const indicator = SpeedMatrix.ComputeQualityIndicator(points, {
                method: QualityIndicatorMethod.MAPE,
            });
            expect(indicator).to.equal(10);
        });

        it('should skip zero gauge values', () => {
            const points = [
                createPoint(0, 10), // skipped (gauge = 0)
                createPoint(100, 110), // 10%
            ];

            const indicator = SpeedMatrix.ComputeQualityIndicator(points, {
                method: QualityIndicatorMethod.MAPE,
            });
            expect(indicator).to.equal(10);
        });

        it('should handle percentage > 100', () => {
            const points = [
                createPoint(10, 30), // |30-10|/10 = 200%
            ];

            const indicator = SpeedMatrix.ComputeQualityIndicator(points, {
                method: QualityIndicatorMethod.MAPE,
            });
            expect(indicator).to.equal(200);
        });
    });

    describe('NASH_SUTCLIFFE method (default)', () => {
        it('should be the default method', () => {
            const points = [createPoint(10, 10), createPoint(20, 20), createPoint(30, 30)];

            // No options = NASH_SUTCLIFFE
            const indicator = SpeedMatrix.ComputeQualityIndicator(points);
            expect(indicator).to.equal(1);
        });

        it('should return 1 for perfect predictions', () => {
            const points = [createPoint(10, 10), createPoint(20, 20), createPoint(30, 30)];

            const indicator = SpeedMatrix.ComputeQualityIndicator(points, {
                method: QualityIndicatorMethod.NASH_SUTCLIFFE,
            });
            expect(indicator).to.equal(1);
        });

        it('should return high value (>0.7) for good predictions', () => {
            const points = [createPoint(10, 12), createPoint(20, 18), createPoint(30, 28)];

            const indicator = SpeedMatrix.ComputeQualityIndicator(points, {
                method: QualityIndicatorMethod.NASH_SUTCLIFFE,
            });
            expect(indicator).to.be.greaterThan(0.7);
            expect(indicator).to.be.lessThan(1);
        });

        it('should return ~0 when model equals mean prediction', () => {
            // If predictions are all equal to mean of observations
            const points = [
                createPoint(10, 20), // mean of gauge = 20
                createPoint(20, 20),
                createPoint(30, 20),
            ];

            const indicator = SpeedMatrix.ComputeQualityIndicator(points, {
                method: QualityIndicatorMethod.NASH_SUTCLIFFE,
            });
            expect(indicator).to.be.approximately(0, 0.01);
        });

        it('should return negative value for poor predictions', () => {
            // Predictions are worse than just using the mean
            const points = [
                createPoint(10, 50), // way off
                createPoint(20, 50), // way off
                createPoint(30, 50), // way off
            ];

            const indicator = SpeedMatrix.ComputeQualityIndicator(points, {
                method: QualityIndicatorMethod.NASH_SUTCLIFFE,
            });
            expect(indicator).to.be.lessThan(0);
        });

        it('should handle constant gauge values', () => {
            const points = [createPoint(10, 10), createPoint(10, 10), createPoint(10, 10)];

            const indicator = SpeedMatrix.ComputeQualityIndicator(points, {
                method: QualityIndicatorMethod.NASH_SUTCLIFFE,
            });
            // All same and perfect => 1
            expect(indicator).to.equal(1);
        });

        it('should return -Infinity for constant gauge with wrong predictions', () => {
            const points = [createPoint(10, 20), createPoint(10, 20), createPoint(10, 20)];

            const indicator = SpeedMatrix.ComputeQualityIndicator(points, {
                method: QualityIndicatorMethod.NASH_SUTCLIFFE,
            });
            expect(indicator).to.equal(-Infinity);
        });
    });

    describe('Edge cases across all methods', () => {
        it('should handle empty array for all methods', () => {
            const methods = [
                QualityIndicatorMethod.DELTA,
                QualityIndicatorMethod.RATIO,
                QualityIndicatorMethod.SUCCESS_RATE,
                QualityIndicatorMethod.RMSE,
                QualityIndicatorMethod.MAPE,
                QualityIndicatorMethod.NASH_SUTCLIFFE,
            ];

            for (const method of methods) {
                const indicator = SpeedMatrix.ComputeQualityIndicator([], {method});
                expect(indicator).to.equal(0, `${method} should return 0 for empty array`);
            }
        });

        it('should handle single point for all methods', () => {
            const points = [createPoint(100, 100)];

            expect(
                SpeedMatrix.ComputeQualityIndicator(points, {method: QualityIndicatorMethod.DELTA})
            ).to.equal(0);
            expect(
                SpeedMatrix.ComputeQualityIndicator(points, {method: QualityIndicatorMethod.RATIO})
            ).to.equal(1);
            expect(
                SpeedMatrix.ComputeQualityIndicator(points, {
                    method: QualityIndicatorMethod.SUCCESS_RATE,
                })
            ).to.equal(100);
            expect(
                SpeedMatrix.ComputeQualityIndicator(points, {method: QualityIndicatorMethod.RMSE})
            ).to.equal(0);
            expect(
                SpeedMatrix.ComputeQualityIndicator(points, {method: QualityIndicatorMethod.MAPE})
            ).to.equal(0);
            expect(
                SpeedMatrix.ComputeQualityIndicator(points, {
                    method: QualityIndicatorMethod.NASH_SUTCLIFFE,
                })
            ).to.equal(1);
        });

        it('should handle points with missing gauge value', () => {
            const pointWithMissingGauge = new QualityPoint({
                gaugeId: 'gauge1',
                gaugeLabel: 'test',
                gaugeDate: new Date(),
                rainDate: new Date(),
                gaugeCartesianValue: null,
                rainCartesianValues: [new CartesianValue({value: 10, lat: 1, lng: 1})],
                speed: {x: 0, y: 0},
                remark: '',
            });
            const validPoint = createPoint(100, 100);
            const points = [pointWithMissingGauge, validPoint];

            // Should only use the valid point
            expect(
                SpeedMatrix.ComputeQualityIndicator(points, {method: QualityIndicatorMethod.DELTA})
            ).to.equal(0);
            expect(
                SpeedMatrix.ComputeQualityIndicator(points, {method: QualityIndicatorMethod.RATIO})
            ).to.equal(1);
        });
    });

    describe('Real-world scenario', () => {
        it('should compare all methods on the same dataset', () => {
            // Simulated real-world data: gauge vs radar rain values (mm/h)
            const points = [
                createPoint(0, 0), // No rain, correctly predicted
                createPoint(2.5, 2.8), // Light rain
                createPoint(5.0, 4.2), // Moderate rain
                createPoint(12.0, 10.5), // Heavy rain
                createPoint(25.0, 22.0), // Very heavy rain
                createPoint(8.0, 6.5), // Moderate rain
                createPoint(1.0, 1.5), // Light rain
                createPoint(0, 0.2), // False positive (predicted rain when none)
            ];

            const delta = SpeedMatrix.ComputeQualityIndicator(points, {
                method: QualityIndicatorMethod.DELTA,
            });
            const ratio = SpeedMatrix.ComputeQualityIndicator(points, {
                method: QualityIndicatorMethod.RATIO,
            });
            const successRate = SpeedMatrix.ComputeQualityIndicator(points, {
                method: QualityIndicatorMethod.SUCCESS_RATE,
            });
            const rmse = SpeedMatrix.ComputeQualityIndicator(points, {
                method: QualityIndicatorMethod.RMSE,
            });
            const mape = SpeedMatrix.ComputeQualityIndicator(points, {
                method: QualityIndicatorMethod.MAPE,
            });
            const nse = SpeedMatrix.ComputeQualityIndicator(points, {
                method: QualityIndicatorMethod.NASH_SUTCLIFFE,
            });

            // Verify reasonable ranges
            expect(delta).to.be.greaterThan(0).and.lessThan(5);
            expect(ratio).to.be.greaterThan(0.7).and.lessThanOrEqual(1);
            expect(successRate).to.be.greaterThan(50).and.lessThanOrEqual(100);
            expect(rmse).to.be.greaterThan(0).and.lessThan(5);
            expect(mape).to.be.greaterThan(0).and.lessThan(50);
            expect(nse).to.be.greaterThan(0.9).and.lessThanOrEqual(1);

            // Log for visibility (will show during test run)
            console.log('Real-world scenario results:');
            console.log(`  DELTA: ${delta.toFixed(2)} (lower is better, 0 = perfect)`);
            console.log(`  RATIO: ${ratio.toFixed(2)} (higher is better, 1 = perfect)`);
            console.log(
                `  SUCCESS_RATE: ${successRate.toFixed(1)}% (higher is better, 100 = perfect)`
            );
            console.log(`  RMSE: ${rmse.toFixed(2)} (lower is better, 0 = perfect)`);
            console.log(`  MAPE: ${mape.toFixed(1)}% (lower is better, 0 = perfect)`);
            console.log(`  NASH_SUTCLIFFE: ${nse.toFixed(3)} (higher is better, 1 = perfect)`);
        });
    });

    describe('NormalizeQualityIndicator', () => {
        describe('should normalize all methods to 0-100 scale (0=bad, 100=best)', () => {
            it('should return 100 for perfect predictions on all methods', () => {
                const points = [createPoint(10, 10), createPoint(20, 20), createPoint(30, 30)];

                const methods = [
                    QualityIndicatorMethod.DELTA,
                    QualityIndicatorMethod.RATIO,
                    QualityIndicatorMethod.SUCCESS_RATE,
                    QualityIndicatorMethod.RMSE,
                    QualityIndicatorMethod.MAPE,
                    QualityIndicatorMethod.NASH_SUTCLIFFE,
                ];

                for (const method of methods) {
                    const normalized = SpeedMatrix.ComputeNormalizedQualityIndicator(points, {
                        method,
                    });
                    expect(normalized).to.equal(100, `${method} should return 100 for perfect`);
                }
            });
        });

        describe('SUCCESS_RATE normalization', () => {
            it('should keep value as-is (already 0-100)', () => {
                expect(
                    SpeedMatrix.NormalizeQualityIndicator(50, QualityIndicatorMethod.SUCCESS_RATE)
                ).to.equal(50);
                expect(
                    SpeedMatrix.NormalizeQualityIndicator(100, QualityIndicatorMethod.SUCCESS_RATE)
                ).to.equal(100);
                expect(
                    SpeedMatrix.NormalizeQualityIndicator(0, QualityIndicatorMethod.SUCCESS_RATE)
                ).to.equal(0);
            });
        });

        describe('RATIO normalization', () => {
            it('should multiply by 100', () => {
                expect(
                    SpeedMatrix.NormalizeQualityIndicator(1, QualityIndicatorMethod.RATIO)
                ).to.equal(100);
                expect(
                    SpeedMatrix.NormalizeQualityIndicator(0.5, QualityIndicatorMethod.RATIO)
                ).to.equal(50);
                expect(
                    SpeedMatrix.NormalizeQualityIndicator(0, QualityIndicatorMethod.RATIO)
                ).to.equal(0);
            });
        });

        describe('NASH_SUTCLIFFE normalization', () => {
            it('should clamp negative values to 0 and scale to 100', () => {
                expect(
                    SpeedMatrix.NormalizeQualityIndicator(1, QualityIndicatorMethod.NASH_SUTCLIFFE)
                ).to.equal(100);
                expect(
                    SpeedMatrix.NormalizeQualityIndicator(
                        0.5,
                        QualityIndicatorMethod.NASH_SUTCLIFFE
                    )
                ).to.equal(50);
                expect(
                    SpeedMatrix.NormalizeQualityIndicator(0, QualityIndicatorMethod.NASH_SUTCLIFFE)
                ).to.equal(0);
                expect(
                    SpeedMatrix.NormalizeQualityIndicator(-1, QualityIndicatorMethod.NASH_SUTCLIFFE)
                ).to.equal(0);
                expect(
                    SpeedMatrix.NormalizeQualityIndicator(
                        -Infinity,
                        QualityIndicatorMethod.NASH_SUTCLIFFE
                    )
                ).to.equal(0);
            });

            it('should allow custom min clamp', () => {
                expect(
                    SpeedMatrix.NormalizeQualityIndicator(
                        -0.5,
                        QualityIndicatorMethod.NASH_SUTCLIFFE,
                        {nashSutcliffeMinClamp: -1}
                    )
                ).to.equal(-50);
            });
        });

        describe('DELTA normalization', () => {
            it('should invert using reference max (default 10 mm/h)', () => {
                // 0 error = 100 quality
                expect(
                    SpeedMatrix.NormalizeQualityIndicator(0, QualityIndicatorMethod.DELTA)
                ).to.equal(100);
                // 5 mm/h error = 50 quality (with default maxRef=10)
                expect(
                    SpeedMatrix.NormalizeQualityIndicator(5, QualityIndicatorMethod.DELTA)
                ).to.equal(50);
                // 10 mm/h error = 0 quality
                expect(
                    SpeedMatrix.NormalizeQualityIndicator(10, QualityIndicatorMethod.DELTA)
                ).to.equal(0);
                // >10 mm/h error = clamped to 0
                expect(
                    SpeedMatrix.NormalizeQualityIndicator(20, QualityIndicatorMethod.DELTA)
                ).to.equal(0);
            });

            it('should use custom reference max', () => {
                // 5 mm/h error with maxRef=20 = 75 quality
                expect(
                    SpeedMatrix.NormalizeQualityIndicator(5, QualityIndicatorMethod.DELTA, {
                        deltaMaxRef: 20,
                    })
                ).to.equal(75);
            });
        });

        describe('RMSE normalization', () => {
            it('should invert using reference max (default 10 mm/h)', () => {
                expect(
                    SpeedMatrix.NormalizeQualityIndicator(0, QualityIndicatorMethod.RMSE)
                ).to.equal(100);
                expect(
                    SpeedMatrix.NormalizeQualityIndicator(5, QualityIndicatorMethod.RMSE)
                ).to.equal(50);
                expect(
                    SpeedMatrix.NormalizeQualityIndicator(10, QualityIndicatorMethod.RMSE)
                ).to.equal(0);
            });

            it('should use custom reference max', () => {
                expect(
                    SpeedMatrix.NormalizeQualityIndicator(5, QualityIndicatorMethod.RMSE, {
                        rmseMaxRef: 25,
                    })
                ).to.equal(80);
            });
        });

        describe('MAPE normalization', () => {
            it('should invert using reference max (default 100%)', () => {
                expect(
                    SpeedMatrix.NormalizeQualityIndicator(0, QualityIndicatorMethod.MAPE)
                ).to.equal(100);
                expect(
                    SpeedMatrix.NormalizeQualityIndicator(50, QualityIndicatorMethod.MAPE)
                ).to.equal(50);
                expect(
                    SpeedMatrix.NormalizeQualityIndicator(100, QualityIndicatorMethod.MAPE)
                ).to.equal(0);
                // >100% error = clamped to 0
                expect(
                    SpeedMatrix.NormalizeQualityIndicator(200, QualityIndicatorMethod.MAPE)
                ).to.equal(0);
            });

            it('should use custom reference max', () => {
                expect(
                    SpeedMatrix.NormalizeQualityIndicator(50, QualityIndicatorMethod.MAPE, {
                        mapeMaxRef: 200,
                    })
                ).to.equal(75);
            });
        });

        describe('ComputeNormalizedQualityIndicator', () => {
            it('should compute and normalize in one call', () => {
                const points = [
                    createPoint(10, 12), // delta = 2
                    createPoint(20, 18), // delta = 2
                ];
                // Raw DELTA = 2, normalized = 100 - (2/10)*100 = 80
                const normalized = SpeedMatrix.ComputeNormalizedQualityIndicator(points, {
                    method: QualityIndicatorMethod.DELTA,
                });
                expect(normalized).to.equal(80);
            });

            it('should pass normalization options', () => {
                const points = [
                    createPoint(10, 12), // delta = 2
                    createPoint(20, 18), // delta = 2
                ];
                // Raw DELTA = 2, with maxRef=4: normalized = 100 - (2/4)*100 = 50
                const normalized = SpeedMatrix.ComputeNormalizedQualityIndicator(
                    points,
                    {method: QualityIndicatorMethod.DELTA},
                    {deltaMaxRef: 4}
                );
                expect(normalized).to.equal(50);
            });
        });

        describe('Real-world scenario with normalization', () => {
            it('should normalize all methods to comparable 0-100 scale', () => {
                const points = [
                    createPoint(0, 0),
                    createPoint(2.5, 2.8),
                    createPoint(5.0, 4.2),
                    createPoint(12.0, 10.5),
                    createPoint(25.0, 22.0),
                    createPoint(8.0, 6.5),
                    createPoint(1.0, 1.5),
                    createPoint(0, 0.2),
                ];

                const methods = [
                    QualityIndicatorMethod.DELTA,
                    QualityIndicatorMethod.RATIO,
                    QualityIndicatorMethod.SUCCESS_RATE,
                    QualityIndicatorMethod.RMSE,
                    QualityIndicatorMethod.MAPE,
                    QualityIndicatorMethod.NASH_SUTCLIFFE,
                ];

                console.log('\nNormalized quality indicators (0=bad, 100=best):');
                for (const method of methods) {
                    const raw = SpeedMatrix.ComputeQualityIndicator(points, {method});
                    const normalized = SpeedMatrix.ComputeNormalizedQualityIndicator(points, {
                        method,
                    });

                    // All normalized values should be in 0-100 range
                    expect(normalized).to.be.greaterThanOrEqual(0);
                    expect(normalized).to.be.lessThanOrEqual(100);

                    console.log(
                        `  ${method.padEnd(15)}: raw=${raw.toFixed(2).padStart(8)} → normalized=${normalized.toFixed(1).padStart(6)}`
                    );
                }
            });
        });

        describe('Default values', () => {
            it('should export correct default values', () => {
                expect(QUALITY_NORMALIZATION_DEFAULTS.DELTA_MAX_REF).to.equal(10);
                expect(QUALITY_NORMALIZATION_DEFAULTS.RMSE_MAX_REF).to.equal(10);
                expect(QUALITY_NORMALIZATION_DEFAULTS.MAPE_MAX_REF).to.equal(100);
                expect(QUALITY_NORMALIZATION_DEFAULTS.NASH_SUTCLIFFE_MIN_CLAMP).to.equal(0);
            });
        });
    });
});
