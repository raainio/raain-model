import {PositionHistory} from './history/PositionHistory';
import {PositionValue} from './position/PositionValue';
import {QualityTools} from './tools/QualityTools';
import {Position} from './position/Position';
import {QualityPoint} from './QualityPoint';
import {CartesianTools, CartesianValue} from '../cartesian';
import {
    QualityIndicatorMethod,
    QualityIndicatorOptions,
    QualityNormalizationOptions,
    QUALITY_NORMALIZATION_DEFAULTS,
} from './QualityIndicatorMethod';

export class SpeedMatrix {
    public static DEFAULT_MATRIX_RANGE = 16;
    public static DEFAULT_TRUSTED_INDICATOR = 1;

    protected flattenPositionHistory: number[][];

    constructor(
        public name: string,
        public remarks: string,
        protected qualityPoints: QualityPoint[],
        protected speed: {angleInDegrees: number; pixelsPerPeriod: number} = {
            angleInDegrees: 0,
            pixelsPerPeriod: 0,
        },
        protected trustedTechnicalIndicator = SpeedMatrix.DEFAULT_TRUSTED_INDICATOR,
        protected flattenPositionRange: {xMin: number; xMax: number; yMin: number; yMax: number} = {
            xMin: -SpeedMatrix.DEFAULT_MATRIX_RANGE,
            xMax: SpeedMatrix.DEFAULT_MATRIX_RANGE,
            yMin: -SpeedMatrix.DEFAULT_MATRIX_RANGE,
            yMax: SpeedMatrix.DEFAULT_MATRIX_RANGE,
        },
        public roundScale: Position = new Position({
            x: CartesianTools.DEFAULT_SCALE,
            y: CartesianTools.DEFAULT_SCALE,
        })
    ) {}

    public static CreateFromJson(json: any | SpeedMatrix): SpeedMatrix {
        const created = new SpeedMatrix(
            json.name,
            json.remarks,
            json.qualityPoints,
            json.speed,
            json.trustedTechnicalIndicator,
            json.flattenPositionRange,
            json.roundScale
        );

        if (json.flattenPositionHistory) {
            created.flattenPositionHistory = json.flattenPositionHistory;
        }

        return created;
    }

    /**
     * Compute quality indicator comparing radar predictions vs gauge observations.
     *
     * @param points - Array of QualityPoint containing gauge and rain values
     * @param options - Configuration options
     * @param options.method - The calculation method (default: NASH_SUTCLIFFE)
     * @param options.successThreshold - For SUCCESS_RATE: minimum ratio considered successful (default: 0.8)
     * @returns Quality indicator value (interpretation depends on method)
     */
    public static ComputeQualityIndicator(
        points: QualityPoint[],
        options: QualityIndicatorOptions = {}
    ): number {
        const method = options.method ?? QualityIndicatorMethod.NASH_SUTCLIFFE;
        const successThreshold = options.successThreshold ?? 0.8;

        switch (method) {
            case QualityIndicatorMethod.DELTA:
                return SpeedMatrix.computeDelta(points);
            case QualityIndicatorMethod.RATIO:
                return SpeedMatrix.computeRatio(points);
            case QualityIndicatorMethod.SUCCESS_RATE:
                return SpeedMatrix.computeSuccessRate(points, successThreshold);
            case QualityIndicatorMethod.RMSE:
                return SpeedMatrix.computeRMSE(points);
            case QualityIndicatorMethod.MAPE:
                return SpeedMatrix.computeMAPE(points);
            case QualityIndicatorMethod.NASH_SUTCLIFFE:
                return SpeedMatrix.computeNashSutcliffe(points);
            default:
                return SpeedMatrix.computeDelta(points);
        }
    }

    /**
     * Normalize a raw quality indicator value to 0-100 scale (0=bad, 100=best).
     *
     * @param rawValue - The raw quality indicator value from ComputeQualityIndicator
     * @param method - The method used to compute the raw value
     * @param options - Normalization options (reference max values for unbounded metrics)
     * @returns Normalized value between 0 (worst) and 100 (best)
     */
    public static NormalizeQualityIndicator(
        rawValue: number,
        method: QualityIndicatorMethod,
        options: QualityNormalizationOptions = {}
    ): number {
        const deltaMaxRef = options.deltaMaxRef ?? QUALITY_NORMALIZATION_DEFAULTS.DELTA_MAX_REF;
        const rmseMaxRef = options.rmseMaxRef ?? QUALITY_NORMALIZATION_DEFAULTS.RMSE_MAX_REF;
        const mapeMaxRef = options.mapeMaxRef ?? QUALITY_NORMALIZATION_DEFAULTS.MAPE_MAX_REF;
        const nashMinClamp =
            options.nashSutcliffeMinClamp ??
            QUALITY_NORMALIZATION_DEFAULTS.NASH_SUTCLIFFE_MIN_CLAMP;

        switch (method) {
            case QualityIndicatorMethod.SUCCESS_RATE:
                // Already 0-100 where 100=best
                return Math.max(0, Math.min(100, rawValue));

            case QualityIndicatorMethod.RATIO:
                // 0-1 where 1=best → multiply by 100
                return Math.max(0, Math.min(100, rawValue * 100));

            case QualityIndicatorMethod.NASH_SUTCLIFFE:
                // -∞ to 1 where 1=best → clamp and scale
                const clampedNash = Math.max(nashMinClamp, Math.min(1, rawValue));
                return clampedNash * 100;

            case QualityIndicatorMethod.DELTA:
                // 0-∞ where 0=best → invert using reference max
                const normalizedDelta = Math.max(0, 100 - (rawValue / deltaMaxRef) * 100);
                return Math.min(100, normalizedDelta);

            case QualityIndicatorMethod.RMSE:
                // 0-∞ where 0=best → invert using reference max
                const normalizedRmse = Math.max(0, 100 - (rawValue / rmseMaxRef) * 100);
                return Math.min(100, normalizedRmse);

            case QualityIndicatorMethod.MAPE:
                // 0-∞% where 0=best → invert using reference max
                const normalizedMape = Math.max(0, 100 - (rawValue / mapeMaxRef) * 100);
                return Math.min(100, normalizedMape);

            default:
                return rawValue;
        }
    }

    /**
     * Compute and normalize quality indicator in one call.
     * Returns a value between 0 (worst) and 100 (best).
     *
     * @param points - Array of QualityPoint containing gauge and rain values
     * @param indicatorOptions - Options for the quality indicator calculation
     * @param normalizationOptions - Options for normalization (reference max values)
     * @returns Normalized quality value between 0 (worst) and 100 (best)
     */
    public static ComputeNormalizedQualityIndicator(
        points: QualityPoint[],
        indicatorOptions: QualityIndicatorOptions = {},
        normalizationOptions: QualityNormalizationOptions = {}
    ): number {
        const method = indicatorOptions.method ?? QualityIndicatorMethod.NASH_SUTCLIFFE;
        const rawValue = SpeedMatrix.ComputeQualityIndicator(points, indicatorOptions);
        return SpeedMatrix.NormalizeQualityIndicator(rawValue, method, normalizationOptions);
    }

    static LogPositionValues(
        positionValues: PositionHistory[],
        valueDisplayFn: (v: PositionHistory) => string,
        flattenPositionRange: {xMin: number; xMax: number; yMin: number; yMax: number} = {
            xMin: -SpeedMatrix.DEFAULT_MATRIX_RANGE,
            xMax: SpeedMatrix.DEFAULT_MATRIX_RANGE,
            yMin: -SpeedMatrix.DEFAULT_MATRIX_RANGE,
            yMax: SpeedMatrix.DEFAULT_MATRIX_RANGE,
        },
        logger = console
    ) {
        const labelX = (x: number) => {
            return 'x' + CartesianTools.LabelWithSign(x - flattenPositionRange.xMax);
        };
        const labelY = (y: number) => {
            return 'y' + CartesianTools.LabelWithSign(y - flattenPositionRange.yMax);
        };

        const matrixToRender = {};
        for (let y = flattenPositionRange.yMax - flattenPositionRange.yMin; y >= 0; y--) {
            const xObject = {};
            for (let x = 0; x <= flattenPositionRange.xMax - flattenPositionRange.xMin; x++) {
                xObject[labelX(x)] = valueDisplayFn(
                    new PositionHistory({
                        id: 'id',
                        label: 'label',
                        date: new Date(),
                        x,
                        y,
                        value: 0,
                        valueFromGauge: 0,
                        valueFromRain: 0,
                    })
                );
            }
            matrixToRender[labelY(y)] = xObject;
        }
        for (let x = flattenPositionRange.xMin; x <= flattenPositionRange.xMax; x++) {
            for (let y = flattenPositionRange.yMin; y <= flattenPositionRange.yMax; y++) {
                const value = positionValues.filter((p) => p.x === x && p.y === y)[0];
                const yOfMatrix = y - flattenPositionRange.yMin;
                const xOfMatrix = x - flattenPositionRange.xMin;
                matrixToRender[labelY(yOfMatrix)][labelX(xOfMatrix)] = valueDisplayFn(value);
            }
        }

        logger?.table(matrixToRender);
    }

    public static Normalize(values: PositionValue[]): PositionValue[] {
        const built: PositionValue[] = [];
        let maxValue = Number.EPSILON;
        for (const pos of values) {
            maxValue = Math.max(maxValue, pos.value);
        }
        for (const pos of values) {
            const normalizedValue = pos.value / maxValue;
            built.push(new PositionValue({x: pos.x, y: pos.y, value: normalizedValue}));
        }
        return built;
    }

    // Average absolute difference between rain and gauge
    // Range: 0 to ∞, Perfect: 0
    private static computeDelta(points: QualityPoint[]): number {
        let sum = 0;
        let count = 0;

        for (const point of points) {
            const delta = point.getDelta();
            if (typeof delta === 'undefined') {
                continue;
            }
            sum += delta;
            count++;
        }

        return count > 0 ? sum / count : 0;
    }

    // Average of min/max ratio (uses QualityPoint.getRatio)
    // Range: 0 to 1, Perfect: 1
    private static computeRatio(points: QualityPoint[]): number {
        let sum = 0;
        let count = 0;

        for (const point of points) {
            const rain = point.getRainValue();
            const gauge = point.getGaugeValue();
            if (typeof rain !== 'number' || typeof gauge !== 'number') {
                continue;
            }
            // Skip when both are zero (undefined quality)
            if (rain === 0 && gauge === 0) {
                continue;
            }
            sum += point.getRatio();
            count++;
        }

        return count > 0 ? sum / count : 0;
    }

    // Percentage of points with ratio >= threshold
    // Range: 0 to 100, Perfect: 100
    private static computeSuccessRate(points: QualityPoint[], threshold: number): number {
        let successCount = 0;
        let totalCount = 0;

        for (const point of points) {
            const rain = point.getRainValue();
            const gauge = point.getGaugeValue();
            if (typeof rain !== 'number' || typeof gauge !== 'number') {
                continue;
            }
            // Both zero is considered a success (correct prediction of no rain)
            if (rain === 0 && gauge === 0) {
                successCount++;
                totalCount++;
                continue;
            }
            totalCount++;
            if (point.getRatio() >= threshold) {
                successCount++;
            }
        }

        return totalCount > 0 ? (successCount / totalCount) * 100 : 0;
    }

    // Root Mean Square Error - penalizes large errors more
    // Range: 0 to ∞, Perfect: 0
    private static computeRMSE(points: QualityPoint[]): number {
        let sumSquaredErrors = 0;
        let count = 0;

        for (const point of points) {
            const rain = point.getRainValue();
            const gauge = point.getGaugeValue();
            if (typeof rain !== 'number' || typeof gauge !== 'number') {
                continue;
            }
            const error = rain - gauge;
            sumSquaredErrors += error * error;
            count++;
        }

        return count > 0 ? Math.sqrt(sumSquaredErrors / count) : 0;
    }

    // Mean Absolute Percentage Error
    // Range: 0 to 100+, Perfect: 0
    private static computeMAPE(points: QualityPoint[]): number {
        let sumPercentageErrors = 0;
        let count = 0;

        for (const point of points) {
            const rain = point.getRainValue();
            const gauge = point.getGaugeValue();
            if (typeof rain !== 'number' || typeof gauge !== 'number') {
                continue;
            }
            // Skip zero gauge values to avoid division by zero
            if (gauge === 0) {
                continue;
            }
            const percentageError = Math.abs((rain - gauge) / gauge) * 100;
            sumPercentageErrors += percentageError;
            count++;
        }

        return count > 0 ? sumPercentageErrors / count : 0;
    }

    // Nash-Sutcliffe Efficiency - hydrology standard comparing to mean prediction
    // Range: -∞ to 1, Perfect: 1 (0 = as good as mean, <0 = worse than mean)
    private static computeNashSutcliffe(points: QualityPoint[]): number {
        const validPoints: {rain: number; gauge: number}[] = [];

        for (const point of points) {
            const rain = point.getRainValue();
            const gauge = point.getGaugeValue();
            if (typeof rain === 'number' && typeof gauge === 'number') {
                validPoints.push({rain, gauge});
            }
        }

        if (validPoints.length === 0) {
            return 0;
        }

        // Calculate mean of observed (gauge) values
        const meanGauge = validPoints.reduce((sum, p) => sum + p.gauge, 0) / validPoints.length;

        // Calculate sum of squared errors (prediction vs observation)
        let sumSquaredErrors = 0;
        // Calculate sum of squared deviations from mean (variance numerator)
        let sumSquaredDeviations = 0;

        for (const p of validPoints) {
            const error = p.rain - p.gauge;
            sumSquaredErrors += error * error;

            const deviation = p.gauge - meanGauge;
            sumSquaredDeviations += deviation * deviation;
        }

        // Avoid division by zero (all gauge values are the same)
        if (sumSquaredDeviations === 0) {
            // If predictions are also all the same and equal to gauge, perfect score
            return sumSquaredErrors === 0 ? 1 : -Infinity;
        }

        return 1 - sumSquaredErrors / sumSquaredDeviations;
    }

    renderFlatten(options: {normalize: boolean}): PositionValue[] {
        const positionMatrix = this.getFlatten();
        if (positionMatrix.length === 0) {
            return [];
        }

        const positionHistories: PositionValue[] = [];
        let maxValue = 0;
        for (const [iX, posX] of positionMatrix.entries()) {
            for (const [iY, value] of posX.entries()) {
                const x = iX + this.flattenPositionRange.xMin;
                const y = iY + this.flattenPositionRange.yMin;
                maxValue = Math.max(maxValue, value);
                positionHistories.push(new PositionValue({x, y, value}));
            }
        }

        // Normalize
        if (maxValue && options.normalize) {
            positionHistories.forEach((p) => {
                p.value = p.value / maxValue;
            });
        }

        return positionHistories;
    }

    getGaugeIdRelatedValues(id: string): QualityPoint {
        const points = this.qualityPoints.filter((p) => p.gaugeId === id);
        if (points.length === 1) {
            return points[0];
        }
        return null;
    }

    getQualityPoints(): QualityPoint[] {
        return this.qualityPoints.map((p) => new QualityPoint(p));
    }

    getMaxRain(): number {
        const qualityPoints = this.getQualityPoints();
        let max = -1;
        for (const p of qualityPoints) {
            max = Math.max(max, p.getRainValue());
        }
        return max;
    }

    getMaxGauge(): number {
        const qualityPoints = this.getQualityPoints();
        let max = -1;
        for (const p of qualityPoints) {
            max = Math.max(max, p.getGaugeValue());
        }
        return max;
    }

    getTrustedTechnicalIndicator(): number {
        return this.trustedTechnicalIndicator;
    }

    isConsistent(): boolean {
        return this.trustedTechnicalIndicator > SpeedMatrix.DEFAULT_TRUSTED_INDICATOR / 2;
    }

    toJSON() {
        return {
            name: this.name,
            remarks: this.remarks,
            flattenPositionHistory: this.flattenPositionHistory,
            flattenPositionRange: this.flattenPositionRange,
            speed: this.speed,
            qualityPoints: this.qualityPoints,
            trustedTechnicalIndicator: this.trustedTechnicalIndicator,
            roundScale: this.roundScale,
        };
    }

    logFlatten(options: {logger: any; simplify: boolean} = {logger: console, simplify: false}) {
        const logger = options.logger;

        const flatten = this.renderFlatten({normalize: false});
        const positionHistories = flatten.map(
            (pv) =>
                new PositionHistory({
                    id: '-',
                    label: '-',
                    date: null,
                    x: pv.x,
                    y: pv.y,
                    value: pv.value,
                    valueFromGauge: -1,
                    valueFromRain: -1,
                })
        );

        const valueDisplay = (pv: PositionValue): string => {
            const v = pv.value;
            if (options.simplify) {
                if (v === 1) {
                    return '##';
                } else if (v >= 0.8) {
                    return '#';
                } else if (v >= 0.5) {
                    return '=';
                } else if (v >= 0.2) {
                    return '_';
                }
                return ' ';
            }
            return '' + Math.round(v * 1000) / 1000;
        };

        SpeedMatrix.LogPositionValues(
            positionHistories,
            valueDisplay,
            this.flattenPositionRange,
            logger
        );
    }

    getSpeed() {
        if (!this.speed) {
            return {angleInDegrees: 0, pixelsPerPeriod: 0};
        }
        return this.speed;
    }

    protected getFlatten(): number[][] {
        if (this.flattenPositionHistory) {
            return this.flattenPositionHistory;
        }

        this.flattenPositionHistory = [];
        const yWidth = this.flattenPositionRange.yMax - this.flattenPositionRange.yMin + 1;
        const xWidth = this.flattenPositionRange.xMax - this.flattenPositionRange.xMin + 1;
        for (let y = 0; y < yWidth; y++) {
            this.flattenPositionHistory.push(new Array(xWidth).fill(0));
        }

        // same position => add value
        for (const qualityPoint of this.qualityPoints) {
            const value = qualityPoint.getRatio();
            const lat = qualityPoint.getRainLat() - qualityPoint.gaugeCartesianValue.lat;
            const lng = qualityPoint.getRainLng() - qualityPoint.gaugeCartesianValue.lng;
            const cartesianValue = new CartesianValue({value, lat, lng});
            const position = QualityTools.MapLatLngToPosition(cartesianValue);

            const positionX = Math.round(
                position.x / this.roundScale.x - this.flattenPositionRange.xMin
            );
            const positionY = Math.round(
                position.y / this.roundScale.y - this.flattenPositionRange.yMin
            );

            if (0 <= positionX && positionX < xWidth && 0 <= positionY && positionY < yWidth) {
                this.flattenPositionHistory[positionX][positionY] += cartesianValue.value;
            } else {
                throw new Error('Matrix ranges and positions are not consistent.');
            }
        }

        return this.flattenPositionHistory;
    }
}
