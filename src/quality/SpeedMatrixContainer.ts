import {SpeedMatrix} from './SpeedMatrix';
import {PositionValue} from './position/PositionValue';
import {PositionHistory} from './history/PositionHistory';
import {QualityPoint} from './QualityPoint';
import {CartesianValue} from '../cartesian/CartesianValue';
import {RainComputationQuality} from '../rain/RainComputationQuality';

export interface ICompares {
    comparesPerDate: IComparePerDate[],
    compareCumulative: ICompare,
}

export interface IComparePerDate {
    date: Date,
    rainComputationQuality: RainComputationQuality,
    compareTimeline: ICompare[],
}

export interface ICompare {
    name: string,
    date: Date,
    qualityPointsLegacy: QualityPoint[],
    qualityPoints: QualityPoint[],
    maxValue: number,
    remarks: string,
}

export class SpeedMatrixContainer {

    protected qualityPoints: any;
    protected trustedIndicators: number[];
    protected flattenMatrices: PositionValue[][];
    protected matrices: SpeedMatrix[];

    constructor(json: {
        matrices: SpeedMatrix[]
    }) {
        this.qualityPoints = {};
        this.trustedIndicators = [];
        this.flattenMatrices = [];
        this.matrices = json.matrices;
    }

    static CreateFromJson(json: any): SpeedMatrixContainer {
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

    static BuildCompares(qualities: RainComputationQuality[],
                         removeDuplicates = true): ICompares {
        const qualitiesSorted = qualities
            .sort((a, b) => a.date.getTime() - b.date.getTime());
        const comparesPerDate: IComparePerDate[] = [];
        const compareCumulative: ICompare = {
            name: 'cumulative_' + qualities.reduce((p, rcq) => p + '_' + rcq.date.toISOString(), ''),
            date: qualities[0]?.date,
            qualityPointsLegacy: [],
            qualityPoints: [],
            maxValue: 0,
            remarks: '',
        };
        const minDeltaPerDate_GaugeId = {};

        let dateMin = new Date();
        let dateMax = new Date();
        if (qualitiesSorted.length > 0) {
            dateMin = qualitiesSorted[0].date;
            dateMax = qualitiesSorted[qualitiesSorted.length - 1].date;
        }

        // build timelines and store
        for (const rainComputationQuality of qualitiesSorted) {
            const compareTimeline = SpeedMatrixContainer.BuildCompareTimeline(rainComputationQuality, dateMin, dateMax);

            comparesPerDate.push({
                date: rainComputationQuality.date,
                rainComputationQuality,
                compareTimeline
            });

            const qualityPoints: QualityPoint[] = compareTimeline.reduce((p, a) => p.concat(a.qualityPoints), []);
            for (const qualityPoint of qualityPoints) {
                const key = qualityPoint.gaugeDate.toISOString() + '_' + qualityPoint.gaugeId;
                if (!minDeltaPerDate_GaugeId[key]) {
                    minDeltaPerDate_GaugeId[key] = qualityPoint.getDelta();
                }
                minDeltaPerDate_GaugeId[key] = Math.min(minDeltaPerDate_GaugeId[key], qualityPoint.getDelta());
            }
        }

        // loop and search for unique points
        const qualityPointToUsePerDate_GaugeId = {};
        comparesPerDate.forEach(compare => {
            compare.compareTimeline.forEach(timeline => {
                for (let i = timeline.qualityPoints.length - 1; i >= 0; i--) {
                    const qualityPoint = timeline.qualityPoints[i];
                    const key = qualityPoint.gaugeDate.toISOString() + '_' + qualityPoint.gaugeId;
                    if (!qualityPointToUsePerDate_GaugeId[key] && minDeltaPerDate_GaugeId[key]
                        && minDeltaPerDate_GaugeId[key] === qualityPoint.getDelta()) {
                        qualityPointToUsePerDate_GaugeId[key] = qualityPoint;
                    } else {
                        if (removeDuplicates) {
                            timeline.qualityPoints.splice(i, 1);
                        }
                    }
                }
            });
        });

        // compute cumulative based on unique points
        const qualityPointPerGaugeId = {};
        for (const qp of Object.values(qualityPointToUsePerDate_GaugeId)) {
            const qualityPoint = qp as QualityPoint;
            if (!qualityPointPerGaugeId[qualityPoint.gaugeId]) {
                qualityPointPerGaugeId[qualityPoint.gaugeId] = QualityPoint.CreateFromJSON(qualityPoint);
            } else {
                qualityPointPerGaugeId[qualityPoint.gaugeId].accumulateValues(qualityPoint);
            }
        }

        compareCumulative.qualityPoints = Object.values(qualityPointPerGaugeId);
        compareCumulative.qualityPointsLegacy = Object.values(qualityPointPerGaugeId);
        const maxRain = Math.max(...compareCumulative.qualityPoints.map(p => p.getRainValue()));
        const maxGauge = Math.max(...compareCumulative.qualityPoints.map(p => p.getGaugeValue()));
        compareCumulative.maxValue = Math.max(maxRain, maxGauge);

        return {comparesPerDate, compareCumulative};
    }

    static BuildCompareTimeline(currentQuality: RainComputationQuality, dateMin: Date, dateMax: Date): ICompare[] {
        const compares: ICompare[] = [];
        const qualitySpeedMatrixContainer = currentQuality.qualitySpeedMatrixContainer;
        if (!qualitySpeedMatrixContainer) {
            return compares;
        }

        const compareNames = qualitySpeedMatrixContainer.getMatrices()
            .map(m => m.name)
            .sort((a, b) => parseInt(a, 10) - parseInt(b, 10));

        for (const [index, name] of compareNames.entries()) {

            const qualityPointsLegacy = qualitySpeedMatrixContainer.getQualityPoints(name);
            const maxValue = Math.max(qualitySpeedMatrixContainer.getMaxGauge(), qualitySpeedMatrixContainer.getMaxRain());
            const remarks = qualitySpeedMatrixContainer.getMatrix(index)?.remarks;

            const delta = parseInt(name, 10);
            const compareDate = new Date(currentQuality.date.getTime() - delta * 60 * 1000);

            if (dateMin.getTime() <= compareDate.getTime() && compareDate.getTime() <= dateMax.getTime()) {

                let renamed = compareDate.toLocaleString();
                renamed += delta > 0 ? ' since ' : ' in ';
                renamed += Math.abs(delta) + ' minutes';
                const qualityPoints = qualityPointsLegacy.filter((p: any) => p); // no real filter

                const compare: ICompare = {
                    name: renamed,
                    date: compareDate,
                    qualityPointsLegacy,
                    qualityPoints,
                    maxValue,
                    remarks,
                };

                compares.push(compare);
            }
        }

        return compares;
    }

    protected static mergeStillComputed(v1: any, v2: any): any {
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

    protected static mergeDateMin(d1: Date, d2: Date): Date {
        const stillComputed = this.mergeStillComputed(d1, d2);
        if (stillComputed === null) {
            return new Date(Math.min(new Date(d1).getTime(), new Date(d2).getTime()));
        }
        if (stillComputed !== undefined) {
            return new Date(stillComputed);
        }
        return stillComputed;
    }

    protected static mergeDateMax(d1: Date, d2: Date): Date {
        const stillComputed = this.mergeStillComputed(d1, d2);
        if (stillComputed === null) {
            return new Date(Math.max(new Date(d1).getTime(), new Date(d2).getTime()));
        }
        if (stillComputed !== undefined) {
            return new Date(stillComputed);
        }
        return stillComputed;
    }

    protected static mergeAvg(v1: number, v2: number): number {
        if (v1 === 0 && v2 === 0) {
            return 0;
        }

        const stillComputed = this.mergeStillComputed(v1, v2);
        if (stillComputed === null) {
            return (v1 + v2) / 2;
        }
        return stillComputed;
    }

    protected static mergeMin(v1: number, v2: number): number {
        const stillComputed = this.mergeStillComputed(v1, v2);
        if (stillComputed === null) {
            return Math.min(v1, v2);
        }
        return stillComputed;
    }

    protected static mergeConcat(a1: Array<any>, a2: Array<any>): Array<any> {
        const stillComputed = this.mergeStillComputed(a1, a2);
        if (stillComputed === null) {
            return a1.concat(a2);
        }
        return stillComputed;
    }

    protected static mergeReduce(a1: Array<QualityPoint>, a2: Array<QualityPoint>): Array<QualityPoint> {
        const stillComputed = this.mergeStillComputed(a1, a2);
        if (stillComputed === null) {

            const ids = new Map();
            const concatted: QualityPoint[] = a1.concat(a2);
            for (const qualityPoint of concatted) {
                const oldValue = {
                    gaugeValue: 0,
                    rainValue: 0
                };
                // if (ids.has(qualityPoint.gaugeId)) {
                //     oldValue = ids.get(qualityPoint.gaugeId);
                // }
                ids.set(qualityPoint.gaugeId, {
                    gaugeLabel: qualityPoint.gaugeLabel,
                    gaugeValue: qualityPoint.getGaugeValue() + oldValue.gaugeValue,
                    gaugeLat: qualityPoint.gaugeCartesianValue.lat,
                    gaugeLng: qualityPoint.gaugeCartesianValue.lng,
                    rainValue: qualityPoint.getRainValue() + oldValue.rainValue,
                    rainLat: qualityPoint.getRainLat(),
                    rainLng: qualityPoint.getRainLng(),
                    gaugeDate: qualityPoint.gaugeDate,
                    rainDate: qualityPoint.rainDate,
                    rainCartesianValues: qualityPoint.rainCartesianValues,
                    remark: qualityPoint.remark,
                });
            }

            return [...ids].map(([id, value]) => {
                return new QualityPoint({
                    gaugeId: id,
                    gaugeLabel: value.gaugeLabel,
                    gaugeDate: value.gaugeDate,
                    rainDate: value.rainDate,
                    gaugeCartesianValue: new CartesianValue({value: value.gaugeValue, lat: value.gaugeLat, lng: value.gaugeLng}),
                    rainCartesianValues: value.rainCartesianValues,
                    speed: null,
                    remark: value.remark,
                });
            });
        }
        return stillComputed;
    }

    getMatrix(index = 0) {
        if (this.matrices.length <= index) {
            return null;
        }
        return this.matrices[index];
    }

    getMatrixByName(name: string) {
        const found = this.matrices.filter(m => m.name === name);
        if (found.length === 1) {
            return found[0];
        }
        return null;
    }

    getMatrices(): SpeedMatrix[] {
        return this.matrices;
    }

    getQualityPoints(matrixName?: string): QualityPoint[] {

        if (this.matrices.length === 0) {
            return [];
        }

        this.storeFlattenMatrices();

        let matrixNames = [matrixName];
        if (!matrixName) {
            matrixNames = this.matrices.map(m => m.name);
        } else {
            if (this.qualityPoints[matrixName]?.length > 0 && this.flattenMatrices.length > 0) {
                return this.qualityPoints[matrixName];
            }
        }

        let qualityPoints: QualityPoint[] = [];
        for (const name of matrixNames) {
            const matricesWithSameName = this.matrices.filter(m => m.name === name);
            if (matricesWithSameName.length === 1) {
                const points = matricesWithSameName[0].getQualityPoints().map(p => new QualityPoint(p));
                qualityPoints = qualityPoints.concat(points);

                // store
                this.qualityPoints[name] = points;
            }
        }

        return qualityPoints;
    }

    getQualityPointsByHistoricalPosition(position: number = 0): QualityPoint[] {

        if (this.matrices.length <= 1) {
            return [];
        }

        const matrixFound = this.matrices
            .sort((a, b) => parseInt(a.name, 10) - parseInt(b.name, 10))
            .filter((m, index) => index === position);

        if (matrixFound.length === 1) {
            return this.getQualityPoints(matrixFound[0].name);
        }

        return [];
    }

    getMaxGauge(matrixName?: string): number {
        const qualityPoints = this.getQualityPoints(matrixName);
        let max = -1;
        for (const p of qualityPoints) {
            max = Math.max(max, p.getGaugeValue());
        }
        return max;
    }

    getMaxRain(matrixName?: string): number {
        const qualityPoints = this.getQualityPoints(matrixName);
        let max = -1;
        for (const p of qualityPoints) {
            max = Math.max(max, p.getRainValue());
        }
        return max;
    }

    /**
     * Get summed quality indicator (0 ideally)
     *  @link SpeedMatrix.ComputeQualityIndicator
     */
    getQuality(matrixName?: string): number {
        const qualityPoints = this.getQualityPoints(matrixName);
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

    getSpeed(): { angleInDegrees: number, pixelsPerPeriod: number } {
        let mergedSpeed: { angleInDegrees: number, pixelsPerPeriod: number };

        for (const matrix of this.matrices) {
            if (!mergedSpeed) {
                mergedSpeed = matrix.getSpeed();
            } else {
                mergedSpeed = {
                    angleInDegrees: SpeedMatrixContainer.mergeAvg(mergedSpeed.angleInDegrees, matrix.getSpeed().angleInDegrees),
                    pixelsPerPeriod: SpeedMatrixContainer.mergeAvg(mergedSpeed.pixelsPerPeriod, matrix.getSpeed().pixelsPerPeriod),
                }
            }
        }

        if (!mergedSpeed) {
            mergedSpeed = {angleInDegrees: 0, pixelsPerPeriod: 0};
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

        this.trustedIndicators = SpeedMatrixContainer.mergeConcat(this.getTrustedIndicators(),
            speedMatrixContainerToMergeIn.getTrustedIndicators());
        this.matrices = SpeedMatrixContainer.mergeConcat(this.matrices,
            speedMatrixContainerToMergeIn.matrices);
        this.flattenMatrices = SpeedMatrixContainer.mergeConcat(this.flattenMatrices,
            speedMatrixContainerToMergeIn.flattenMatrices);

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
            if (!pv) {
                return '';
            }
            return '' + Math.round(pv.value * 1000) / 1000;
        }

        SpeedMatrix.LogPositionValues(positionHistories, valueDisplay);
    }

    protected storeFlattenMatrices() {

        if (this.flattenMatrices.length === this.matrices.length) {
            return this.flattenMatrices;
        }

        const flattenMatrices = [];
        for (const matrix of this.matrices) {
            if (matrix.isConsistent()) {
                flattenMatrices.push(matrix.renderFlatten({normalize: true}));
            }
        }

        this.flattenMatrices = flattenMatrices;
    }

}
