import {SpeedMatrix} from './SpeedMatrix';
import {PositionValue} from './position/PositionValue';
import {PositionHistory} from './history/PositionHistory';
import {QualityPoint} from './QualityPoint';
import {CartesianValue} from '../cartesian/CartesianValue';

export class SpeedMatrixContainer {

    protected qualityPoints: QualityPoint[];
    protected trustedIndicators: number[];
    protected flattenMatrices: PositionValue[][];
    protected matrices: SpeedMatrix[];

    constructor(json: {
        matrices: SpeedMatrix[]
    }) {
        this.qualityPoints = undefined;
        this.trustedIndicators = [];
        this.flattenMatrices = [];
        this.matrices = json.matrices;
    }

    public static CreateFromJson(json: any): SpeedMatrixContainer {
        const created = new SpeedMatrixContainer({matrices: []});
        if (json?.qualityPoints) {
            created.qualityPoints = json.qualityPoints;
        }
        if (json?.matrices) {
            created.matrices = json.matrices.map((m: any) => SpeedMatrix.CreateFromJson(m));
        }
        if (json?.trustedIndicators) {
            created.trustedIndicators = json.trustedIndicators;
        }
        if (json?.flattenMatrices) {
            created.flattenMatrices = json.flattenMatrices;
        }
        return created;
    }

    getMatrix(index = 0) {
        return this.getMatrices()[index];
    }

    getMatrices(): SpeedMatrix[] {
        return this.matrices;
    }

    getQualityPoints(): QualityPoint[] {
        if (this.qualityPoints) {
            if (this.qualityPoints.length > 0 && this.flattenMatrices.length > 0) {
                return this.qualityPoints.map(p => new QualityPoint(p));
            } else {
                this.qualityPoints = [];
            }
        }

        const flattenMatrices = [];
        let qualityPoints: QualityPoint[] = [];
        for (const matrix of this.matrices) {
            if (matrix.isConsistent()) {
                flattenMatrices.push(matrix.renderFlatten({normalize: true}));
                qualityPoints = this.mergeReduce(qualityPoints, matrix.getQualityPoints());
            }
        }

        // store
        this.flattenMatrices = flattenMatrices;
        this.qualityPoints = qualityPoints.map(p => new QualityPoint(p));
        return this.qualityPoints;
    }

    getMaxGauge(): number {
        const qualityPoints = this.getQualityPoints();
        let max = -1;
        for (const p of qualityPoints) {
            max = Math.max(max, p.gaugeCartesianValue.value);
        }
        return max;
    }

    getMaxRain(): number {
        const qualityPoints = this.getQualityPoints();
        let max = -1;
        for (const p of qualityPoints) {
            max = Math.max(max, p.getValue());
        }
        return max;
    }

    /**
     * Get summed quality indicator (0 ideally)
     *  @link SpeedMatrix.ComputeQualityIndicator
     */
    getQuality(): number {
        const qualityPoints = this.getQualityPoints();
        return SpeedMatrix.ComputeQualityIndicator(qualityPoints);
    }

    getTrustedIndicators(): number[] {
        if (this.trustedIndicators.length > 0) {
            return this.trustedIndicators;
        }

        this.trustedIndicators = [];
        for (const matrix of this.matrices) {
            this.trustedIndicators.push(matrix.getTrustedTechnicalIndicator());
        }

        return this.trustedIndicators;
    }

    getSpeed(): { angleInDegrees: number, pixelCountPerHour: number } {
        let mergedSpeed: { angleInDegrees: number, pixelCountPerHour: number };

        for (const matrix of this.matrices) {
            if (!mergedSpeed) {
                mergedSpeed = matrix.getSpeed();
            } else {
                mergedSpeed = {
                    angleInDegrees: this.mergeAvg(mergedSpeed.angleInDegrees, matrix.getSpeed().angleInDegrees),
                    pixelCountPerHour: this.mergeAvg(mergedSpeed.pixelCountPerHour, matrix.getSpeed().pixelCountPerHour),
                }
            }
        }

        if (!mergedSpeed) {
            mergedSpeed = {angleInDegrees: 0, pixelCountPerHour: 0};
        }

        return mergedSpeed;
    }

    isConsistent(): boolean {
        const indics = this.getTrustedIndicators();
        let indicAverage = 0;
        for (const indic of indics) {
            indicAverage += indic;
        }
        indicAverage = indicAverage / (indics.length ? indics.length : 1);
        return indicAverage > (SpeedMatrix.DEFAULT_TRUSTED_INDICATOR / 2);
    }

    getFlattenMatrixCount(): number {
        return this.flattenMatrices.length;
    }

    renderFlattenMatrix(index = 0,
                        options: { normalize?: boolean } = {normalize: true}): PositionValue[] {

        let rendered: PositionValue[];
        if (this.flattenMatrices && this.flattenMatrices[index]) {
            rendered = this.flattenMatrices[index];
        } else {
            this.getQualityPoints();
            rendered = this.flattenMatrices[index];
        }

        if (options.normalize) {
            rendered = SpeedMatrix.Normalize(rendered);
        }

        return rendered;
    }

    renderMergedMatrix(options: { normalize?: boolean } = {normalize: true}): PositionValue[] {
        const count = this.flattenMatrices.length;
        const size = Math.sqrt(this.flattenMatrices[0]?.length);
        const range = (size - 1) / 2;
        let maxValue = 0;
        let matrix: PositionValue[] = [];
        for (let x = -range; x <= range; x++) {
            for (let y = -range; y <= range; y++) {
                let value = 0;
                for (const flattenMatrix of this.flattenMatrices) {
                    const pos = flattenMatrix.filter(v => v.x === x && v.y === y)[0];
                    value += pos.value;
                    maxValue = Math.max(maxValue, value);
                }
                value = value / count;
                matrix.push(new PositionValue({x, y, value}));
            }
        }

        if (options.normalize) {
            matrix = SpeedMatrix.Normalize(matrix);
        }

        return matrix;
    }

    toJSON(options?: {
        removeFlatten?: boolean,
        removeMatrices?: boolean,
        removeIndicators?: boolean,
    }) {
        const json = {
            qualityPoints: this.getQualityPoints(),
            trustedIndicators: this.getTrustedIndicators(),
            flattenMatrices: this.flattenMatrices,
            speed: this.getSpeed(),
            matrices: this.matrices
                .filter(m => !!m)
                .map(m => m.toJSON()),
        };

        if (options?.removeMatrices) {
            delete json.matrices;
        }

        if (options?.removeFlatten) {
            delete json.flattenMatrices;
        }

        if (options?.removeIndicators) {
            delete json.trustedIndicators;
        }

        return json;
    }

    merge(speedMatrixContainerToMergeIn: SpeedMatrixContainer) {

        this.qualityPoints = this.mergeReduce(this.getQualityPoints(), speedMatrixContainerToMergeIn.getQualityPoints());
        this.trustedIndicators = this.mergeConcat(this.getTrustedIndicators(), speedMatrixContainerToMergeIn.getTrustedIndicators());
        this.matrices = this.mergeConcat(this.matrices, speedMatrixContainerToMergeIn.matrices);
        this.flattenMatrices = this.mergeConcat(this.flattenMatrices, speedMatrixContainerToMergeIn.flattenMatrices);

        return this;
    }

    logMergedMatrix(options: { normalize?: boolean } = {normalize: true}) {

        const mergedMatrix = this.renderMergedMatrix(options);
        const positionHistories = mergedMatrix.map(pv => new PositionHistory({
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
            return '' + Math.round(pv.value * 1000) / 1000;
        }

        SpeedMatrix.LogPositionValues(positionHistories, valueDisplay);
    }

    protected mergeStillComputed(v1: any, v2: any): any {
        if (!v1 && !v2) {
            return undefined;
        }
        if (!v1) {
            return v2;
        }
        if (!v2) {
            return v1;
        }
        return null;
    }

    protected mergeDateMin(d1: Date, d2: Date): Date {
        const stillComputed = this.mergeStillComputed(d1, d2);
        if (stillComputed === null) {
            return new Date(Math.min(new Date(d1).getTime(), new Date(d2).getTime()));
        }
        if (stillComputed !== undefined) {
            return new Date(stillComputed);
        }
        return stillComputed;
    }

    protected mergeDateMax(d1: Date, d2: Date): Date {
        const stillComputed = this.mergeStillComputed(d1, d2);
        if (stillComputed === null) {
            return new Date(Math.max(new Date(d1).getTime(), new Date(d2).getTime()));
        }
        if (stillComputed !== undefined) {
            return new Date(stillComputed);
        }
        return stillComputed;
    }

    protected mergeAvg(v1: number, v2: number): number {
        if (v1 === 0 && v2 === 0) {
            return 0;
        }

        const stillComputed = this.mergeStillComputed(v1, v2);
        if (stillComputed === null) {
            return (v1 + v2) / 2;
        }
        return stillComputed;
    }

    protected mergeMin(v1: number, v2: number): number {
        const stillComputed = this.mergeStillComputed(v1, v2);
        if (stillComputed === null) {
            return Math.min(v1, v2);
        }
        return stillComputed;
    }

    protected mergeConcat(a1: Array<any>, a2: Array<any>): Array<any> {
        const stillComputed = this.mergeStillComputed(a1, a2);
        if (stillComputed === null) {
            return a1.concat(a2);
        }
        return stillComputed;
    }

    protected mergeReduce(a1: Array<QualityPoint>, a2: Array<QualityPoint>): Array<QualityPoint> {
        const stillComputed = this.mergeStillComputed(a1, a2);
        if (stillComputed === null) {

            const ids = new Map();
            const concatted: QualityPoint[] = a1.concat(a2);
            for (const qualityPoint of concatted) {
                let oldValue = {
                    gaugeValue: 0,
                    rainValue: 0
                };
                if (ids.has(qualityPoint.gaugeId)) {
                    oldValue = ids.get(qualityPoint.gaugeId);
                }
                ids.set(qualityPoint.gaugeId, {
                    gaugeLabel: qualityPoint.gaugeLabel,
                    gaugeValue: qualityPoint.gaugeCartesianValue.value + oldValue.gaugeValue,
                    gaugeLat: qualityPoint.gaugeCartesianValue.lat,
                    gaugeLng: qualityPoint.gaugeCartesianValue.lng,
                    rainValue: qualityPoint.getValue() + oldValue.rainValue,
                    rainLat: qualityPoint.getValueLat(),
                    rainLng: qualityPoint.getValueLng(),
                    gaugeDate: qualityPoint.gaugeDate,
                    rainDate: qualityPoint.rainDate,
                });
            }

            return [...ids].map(([id, value]) => {
                return new QualityPoint({
                    gaugeId: id,
                    gaugeLabel: value.gaugeLabel,
                    gaugeDate: value.gaugeDate,
                    rainDate: value.rainDate,
                    gaugeCartesianValue: new CartesianValue({value: value.gaugeValue, lat: value.gaugeLat, lng: value.gaugeLng}),
                    rainCartesianValues: [new CartesianValue({value: value.rainValue, lat: value.rainLat, lng: value.rainLng})],
                    speed: null,
                });
            });
        }
        return stillComputed;
    }

}
