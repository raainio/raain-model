import {PositionHistory} from './history/PositionHistory';
import {PositionValue} from './position/PositionValue';
import {QualityTools} from './tools/QualityTools';
import {Position} from './position/Position';
import {QualityPoint} from './QualityPoint';
import {CartesianValue} from '../cartesian/CartesianValue';
import {LatLng} from '../cartesian/LatLng';

export class SpeedMatrix {

    public static DEFAULT_MATRIX_RANGE = 4;
    public static DEFAULT_TRUSTED_INDICATOR = 1;

    protected flattenPositionHistory: number[][];

    constructor(
        protected qualityPoints: QualityPoint[],
        protected speed: { angleInDegrees: number, pixelCountPerHour: number } = {angleInDegrees: 0, pixelCountPerHour: 0},
        protected trustedTechnicalIndicator = SpeedMatrix.DEFAULT_TRUSTED_INDICATOR,
        protected flattenPositionRange: { xMin: number, xMax: number, yMin: number, yMax: number } = {
            xMin: -SpeedMatrix.DEFAULT_MATRIX_RANGE,
            xMax: SpeedMatrix.DEFAULT_MATRIX_RANGE,
            yMin: -SpeedMatrix.DEFAULT_MATRIX_RANGE,
            yMax: SpeedMatrix.DEFAULT_MATRIX_RANGE
        },
        protected roundScale: Position = new Position({x: QualityTools.DEFAULT_SCALE, y: QualityTools.DEFAULT_SCALE})
    ) {
    }

    public static CreateFromJson(json: any | SpeedMatrix): SpeedMatrix {
        const created = new SpeedMatrix(
            json.qualityPoints,
            json.speed,
            json.trustedTechnicalIndicator,
            json.flattenPositionRange,
            json.roundScale);

        if (json.flattenPositionHistory) {
            created.flattenPositionHistory = json.flattenPositionHistory;
        }

        return created;
    }

    /**
     * Get quality indicator based on delta from computed vs reality
     *  0 is ideal
     *  2.56 (for example) is not ideal => can be improved :)
     */
    public static ComputeQualityIndicator(points: QualityPoint[]): number {
        let indicator = 0;
        for (const point of points) {
            indicator += point.getDelta();
        }
        if (points.length > 0) {
            indicator = indicator / points.length;
        }

        return indicator;
    }

    static LogPositionValues(positionValues: PositionHistory[],
                             valueDisplayFn: (v: PositionHistory) => string,
                             flattenPositionRange: { xMin: number, xMax: number, yMin: number, yMax: number } = {
                                 xMin: -SpeedMatrix.DEFAULT_MATRIX_RANGE,
                                 xMax: SpeedMatrix.DEFAULT_MATRIX_RANGE,
                                 yMin: -SpeedMatrix.DEFAULT_MATRIX_RANGE,
                                 yMax: SpeedMatrix.DEFAULT_MATRIX_RANGE
                             },
                             logger = console) {

        const labelWithSign = (val: number) => {
            if (val < 0) {
                return '' + val;
            } else if (val === 0) {
                return ' ' + 0;
            }
            return '+' + val;
        }
        const labelX = (x: number) => {
            return 'x' + labelWithSign(x - flattenPositionRange.xMax);
        };
        const labelY = (y: number) => {
            return 'y' + labelWithSign(y - flattenPositionRange.yMax);
        };

        const matrixToRender = {};
        for (let y = flattenPositionRange.yMax - flattenPositionRange.yMin; y >= 0; y--) {
            const xObject = {};
            for (let x = 0; x <= flattenPositionRange.xMax - flattenPositionRange.xMin; x++) {
                xObject[labelX(x)] = valueDisplayFn(new PositionHistory({
                    id: 'id',
                    label: 'label',
                    date: new Date(),
                    x,
                    y,
                    value: 0,
                    valueFromGauge: 0,
                    valueFromRain: 0
                }));
            }
            matrixToRender[labelY(y)] = xObject;
        }
        for (let x = flattenPositionRange.xMin; x <= flattenPositionRange.xMax; x++) {
            for (let y = flattenPositionRange.yMin; y <= flattenPositionRange.yMax; y++) {
                const value = positionValues.filter(p => p.x === x && p.y === y)[0];
                const yOfMatrix = y - flattenPositionRange.yMin;
                const xOfMatrix = x - flattenPositionRange.xMin;
                matrixToRender[labelY(yOfMatrix)][labelX(xOfMatrix)] = valueDisplayFn(value);
            }
        }

        logger.table(matrixToRender);
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

    renderFlatten(options: { normalize: boolean }): PositionValue[] {

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
            positionHistories.forEach(p => {
                p.value = p.value / maxValue;
            });
        }

        return positionHistories;
    }

    getGaugeIdRelatedValues(id: string): QualityPoint {
        const points = this.qualityPoints.filter(p => p.gaugeId === id);
        if (points.length === 1) {
            return points[0];
        }
        return null;
    }

    getQualityPoints(): QualityPoint[] {
        return this.qualityPoints.map(p => new QualityPoint(p));
    }

    getMaxRain(): number {
        const qualityPoints = this.getQualityPoints();
        let max = -1;
        for (const p of qualityPoints) {
            max = Math.max(max, p.getValue());
        }
        return max;
    }

    getMaxGauge(): number {
        const qualityPoints = this.getQualityPoints();
        let max = -1;
        for (const p of qualityPoints) {
            max = Math.max(max, p.gaugeCartesianValue.value);
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
            flattenPositionHistory: this.flattenPositionHistory,
            flattenPositionRange: this.flattenPositionRange,
            speed: this.speed,
            qualityPoints: this.qualityPoints,
            trustedTechnicalIndicator: this.trustedTechnicalIndicator,
            roundScale: this.roundScale,
        };
    }

    logFlatten(options: { overridingLogger?: any, simplify?: boolean }
                   = {overridingLogger: null, simplify: false}) {
        let logger = options.overridingLogger;
        if (!logger) {
            logger = console;
        }

        const flatten = this.renderFlatten({normalize: false});
        const positionHistories = flatten.map(pv => new PositionHistory({
            id: '-',
            label: '-',
            date: null,
            x: pv.x,
            y: pv.y,
            value: pv.value,
            valueFromGauge: -1,
            valueFromRain: -1
        }));

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
        }

        SpeedMatrix.LogPositionValues(positionHistories, valueDisplay, this.flattenPositionRange, logger);
    }

    getSpeed() {
        if (!this.speed) {
            return {angleInDegrees: 0, pixelCountPerHour: 0};
        }
        return this.speed;
    }

    protected getFlatten(): number[][] {
        if (this.flattenPositionHistory) {
            return this.flattenPositionHistory;
        }

        this.flattenPositionHistory = [];
        for (let y = 0; y <= this.flattenPositionRange.yMax - this.flattenPositionRange.yMin; y++) {
            this.flattenPositionHistory.push(new Array(this.flattenPositionRange.xMax - this.flattenPositionRange.xMin + 1).fill(0));
        }

        // same position => add value
        for (const qualityPoint of this.qualityPoints) {
            const ratio = qualityPoint.getRatio();
            const cartesianValue = new CartesianValue({
                value: ratio,
                lat: qualityPoint.getValueLat() - qualityPoint.gaugeCartesianValue.lat,
                lng: qualityPoint.getValueLng() - qualityPoint.gaugeCartesianValue.lng,
            });
            const position = QualityTools.MapLatLngToPosition(cartesianValue, false, new LatLng({
                lat: QualityTools.DEFAULT_SCALE,
                lng: QualityTools.DEFAULT_SCALE
            }));

            const positionX = Math.round((position.x / this.roundScale.x) - this.flattenPositionRange.xMin);
            const positionY = Math.round((position.y / this.roundScale.y) - this.flattenPositionRange.yMin);
            this.flattenPositionHistory[positionX][positionY] += cartesianValue.value;
        }

        return this.flattenPositionHistory;
    }
}
