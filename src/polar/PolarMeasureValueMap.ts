import {MeasureValuePolarContainer} from './MeasureValuePolarContainer';
import {PolarValue} from './PolarValue';
import {PolarMeasureValue} from './PolarMeasureValue';
import {PolarFilter} from './PolarFilter';

/**
 * PolarMeasureValue Map tools to optimize get/set
 */
export class PolarMeasureValueMap {
    protected builtMeasureValuePolarContainers: MeasureValuePolarContainer[] = [];

    constructor(
        public polarMeasureValue: PolarMeasureValue,
        public buildPolarFilter: PolarFilter = new PolarFilter()
    ) {
        this.buildFromPolar();
    }

    static Duplicate(polarMeasureValueMap: PolarMeasureValueMap): PolarMeasureValueMap {
        const pol = new PolarMeasureValueMap(null);
        pol.polarMeasureValue = new PolarMeasureValue(
            polarMeasureValueMap.polarMeasureValue as any
        );
        pol.builtMeasureValuePolarContainers =
            polarMeasureValueMap.builtMeasureValuePolarContainers;
        pol.buildPolarFilter = polarMeasureValueMap.buildPolarFilter;
        return pol;
    }

    protected static UpdateIndex(arrayLength: number, index: number): number {
        let newIndex = index;
        if (arrayLength <= index) {
            newIndex = index - arrayLength;
        } else if (index < 0) {
            newIndex = arrayLength + index;
        }
        if (newIndex < 0) {
            console.warn('### index ? ', newIndex);
        }
        return Math.round(newIndex);
    }

    applyToPolar() {
        const polarMeasureValue = new PolarMeasureValue({
            measureValuePolarContainers: this.builtMeasureValuePolarContainers,
            azimuthsCount: this.polarMeasureValue.getAzimuthsCount(),
            polarEdgesCount: this.polarMeasureValue.getPolarEdgesCount(),
        });

        const filteredPolarMeasureValue = polarMeasureValue.getFiltered({
            nullValues: true,
            ordered: true,
        });

        this.polarMeasureValue.setPolarsAsContainer(filteredPolarMeasureValue.getPolars(), {
            resetCount: false,
        });
    }

    duplicate(polarFilter?: PolarFilter): PolarMeasureValueMap {
        const newPolarMeasureValueMap = new PolarMeasureValueMap(null);
        const measureValuePolarContainers = [];
        for (const measureValuePolarContainer of this.builtMeasureValuePolarContainers) {
            const duplicateMeasureValuePolarContainer = measureValuePolarContainer.getFiltered({
                nullValues: false,
            });
            measureValuePolarContainers.push(duplicateMeasureValuePolarContainer);
        }

        newPolarMeasureValueMap.polarMeasureValue = this.polarMeasureValue;
        newPolarMeasureValueMap.builtMeasureValuePolarContainers = measureValuePolarContainers;
        newPolarMeasureValueMap.buildPolarFilter = this.buildPolarFilter.merging();
        const newBuildPolarFilter = this.buildPolarFilter.merging(polarFilter);

        if (!newPolarMeasureValueMap.buildPolarFilter.equal(newBuildPolarFilter)) {
            newPolarMeasureValueMap.filter(newBuildPolarFilter);
        }

        return newPolarMeasureValueMap;
    }

    getOneRawCircle(edgeIndex: number): number[] {
        const circle: number[] = [];
        for (const container of this.builtMeasureValuePolarContainers) {
            if (container.polarEdges[edgeIndex]) {
                circle.push(container.polarEdges[edgeIndex]);
            } else {
                circle.push(0);
            }
        }
        return circle;
    }

    getOneCircle(edgeIndex: number): number[] {
        const circle: number[] = [];
        const azimuthsCount = this.polarMeasureValue.getAzimuthsCount();
        for (let azimuthIndex = 0; azimuthIndex < azimuthsCount; azimuthIndex++) {
            const polarValue = this.getPolarValue({azimuthIndex, edgeIndex});
            const value = polarValue?.value ?? 0;
            circle.push(value);
        }
        return circle;
    }

    getPolarValue(json: {azimuthIndex: number; edgeIndex: number}): PolarValue {
        let edgeValue = 0;
        let distanceInMetersFound = 0;
        const {azimuthIndex, azimuthInDegrees} = this.updatedAzimuth(json.azimuthIndex);
        if (azimuthIndex >= 0) {
            if (azimuthIndex >= this.builtMeasureValuePolarContainers.length) {
                // throw new Error('Impossible to getPolarValue azimuth from ' + JSON.stringify(json));
                return null;
            }

            const measureValuePolarContainer = this.builtMeasureValuePolarContainers[azimuthIndex];
            const {edgeIndex, distanceInMeters} = this.updatedEdge(
                json.edgeIndex,
                measureValuePolarContainer
            );
            distanceInMetersFound = distanceInMeters;

            if (edgeIndex >= 0) {
                if (edgeIndex >= measureValuePolarContainer.polarEdges.length) {
                    // throw new Error('Impossible to getPolarValue edge from ' + JSON.stringify(json));
                    return null;
                }

                edgeValue = measureValuePolarContainer.polarEdges[edgeIndex];
            }
        } else {
            const {distanceInMeters} = this.updatedEdge(json.edgeIndex);
            distanceInMetersFound = distanceInMeters;
        }

        return new PolarValue({
            value: edgeValue,
            polarAzimuthInDegrees: azimuthInDegrees,
            polarDistanceInMeters: distanceInMetersFound,
        });
    }

    setPolarValue(json: {azimuthIndex: number; edgeIndex: number; value: number}) {
        const {azimuthIndex, azimuthInDegrees} = this.updatedAzimuth(json.azimuthIndex);
        if (azimuthIndex < 0) {
            throw new Error(
                `Impossible to set ${JSON.stringify(json)} in this optimized polar structure`
            );
        }

        const measureValuePolarContainer = this.builtMeasureValuePolarContainers[azimuthIndex];
        const {edgeIndex} = this.updatedEdge(json.edgeIndex, measureValuePolarContainer);
        if (edgeIndex < 0) {
            throw new Error(
                `Impossible to set ${JSON.stringify(json)} in this optimized polar structure`
            );
        }

        measureValuePolarContainer.polarEdges[edgeIndex] = json.value;
    }

    iterate(
        onEachValue: (
            polarValue: PolarValue,
            azimuthIndex: number,
            edgeIndex: number,
            valueSetter: (newValue: number) => void
        ) => void | Promise<void>,
        options?: {
            iterateOnEachEdge?: boolean;
            polarFilter?: PolarFilter;
        }
    ): void | Promise<void> {
        const azimuthMin =
            typeof options?.polarFilter?.azimuthMin !== 'undefined'
                ? options?.polarFilter.azimuthMin
                : 0;
        const azimuthMax =
            typeof options?.polarFilter?.azimuthMax !== 'undefined'
                ? options?.polarFilter.azimuthMax
                : this.polarMeasureValue.getAzimuthsCount();
        const edgeMin =
            typeof options?.polarFilter?.edgeMin !== 'undefined' ? options?.polarFilter.edgeMin : 0;
        const edgeMax =
            typeof options?.polarFilter?.edgeMax !== 'undefined'
                ? options?.polarFilter.edgeMax
                : this.polarMeasureValue.getPolarEdgesCount();

        if (options?.iterateOnEachEdge) {
            return this.iterateOnEachEdge(azimuthMin, azimuthMax, edgeMin, edgeMax, onEachValue);
        } else {
            return this.iterateOnEachAzimuth(azimuthMin, azimuthMax, edgeMin, edgeMax, onEachValue);
        }
    }

    countPolar() {
        return this.builtMeasureValuePolarContainers.reduce(
            (p, c) => p + c.getPolarEdgesCount(),
            0
        );
    }

    countPolarWithEdgeFilter(filter: any) {
        return this.builtMeasureValuePolarContainers.reduce(
            (p, c) => p + c.polarEdges.filter(filter).length,
            0
        );
    }

    filter(polarFilter: PolarFilter) {
        const azimuthsCount = this.polarMeasureValue.getAzimuthsCount();
        const polarEdgesCount = this.polarMeasureValue.getPolarEdgesCount();
        const defaultDistanceBetweenInEdgeInMeters = this.polarMeasureValue.getDefaultDistance();

        const azimuthMin =
            typeof polarFilter.azimuthMin !== 'undefined' ? polarFilter.azimuthMin : 0;
        const azimuthMax =
            typeof polarFilter.azimuthMax !== 'undefined'
                ? Math.min(polarFilter.azimuthMax, azimuthsCount - 1)
                : azimuthsCount - 1;
        const edgeMin = typeof polarFilter.edgeMin !== 'undefined' ? polarFilter.edgeMin : 0;
        const edgeMax =
            typeof polarFilter.edgeMax !== 'undefined'
                ? Math.min(polarFilter.edgeMax, polarEdgesCount - 1)
                : polarEdgesCount - 1;

        const newMeasureValuePolarContainers = [];
        for (let azimuthIndex = azimuthMin; azimuthIndex <= azimuthMax; azimuthIndex++) {
            const azimuthInDegrees = (azimuthIndex * 360) / azimuthsCount;
            const polarEdges = [];
            for (let edgeIndex = edgeMin; edgeIndex <= edgeMax; edgeIndex++) {
                const polarValue = this.getPolarValue({azimuthIndex, edgeIndex});
                polarEdges.push(polarValue.value);
            }
            newMeasureValuePolarContainers.push(
                new MeasureValuePolarContainer({
                    azimuth: azimuthInDegrees,
                    distance: defaultDistanceBetweenInEdgeInMeters,
                    polarEdges,
                    edgeOffset: edgeMin,
                })
            );
        }

        this.buildPolarFilter = polarFilter;
        this.builtMeasureValuePolarContainers = newMeasureValuePolarContainers;
    }

    protected buildFromPolar() {
        if (!this.polarMeasureValue) {
            return [];
        }

        const builtMeasureValuePolarContainers: MeasureValuePolarContainer[] = [];

        const azimuthsCount = this.polarMeasureValue.getAzimuthsCount();
        const polarEdgesCount = this.polarMeasureValue.getPolarEdgesCount();
        const defaultDistanceBetweenInEdgeInMeters = this.polarMeasureValue.getDefaultDistance();

        const azimuthMin =
            typeof this.buildPolarFilter.azimuthMin !== 'undefined'
                ? this.buildPolarFilter.azimuthMin
                : 0;
        const azimuthMax =
            typeof this.buildPolarFilter.azimuthMax !== 'undefined'
                ? this.buildPolarFilter.azimuthMax
                : azimuthsCount - 1;
        const edgeMin =
            typeof this.buildPolarFilter.edgeMin !== 'undefined'
                ? this.buildPolarFilter.edgeMin
                : 0;
        const edgeMax =
            typeof this.buildPolarFilter.edgeMax !== 'undefined'
                ? this.buildPolarFilter.edgeMax
                : polarEdgesCount - 1;

        for (let azIndex = azimuthMin; azIndex <= azimuthMax; azIndex++) {
            const azimuthInDegrees = (azIndex * 360) / azimuthsCount;
            const polarEdges = [];
            for (let edgeIndex = edgeMin; edgeIndex <= edgeMax; edgeIndex++) {
                const distanceInMeters = defaultDistanceBetweenInEdgeInMeters * (edgeIndex + 1);
                const polarValue = this.polarMeasureValue.getPolarValue({
                    azimuthInDegrees,
                    distanceInMeters,
                });
                polarEdges.push(polarValue.value);
            }
            builtMeasureValuePolarContainers.push(
                new MeasureValuePolarContainer({
                    azimuth: azimuthInDegrees,
                    distance: defaultDistanceBetweenInEdgeInMeters,
                    polarEdges,
                    edgeOffset: edgeMin,
                })
            );
        }

        this.builtMeasureValuePolarContainers = builtMeasureValuePolarContainers;
    }

    protected updatedAzimuth(azimuthIndexToUpdate: number) {
        const azimuthsCount = this.polarMeasureValue.getAzimuthsCount();
        const azimuthMin =
            typeof this.buildPolarFilter?.azimuthMin !== 'undefined'
                ? this.buildPolarFilter.azimuthMin
                : 0;

        const azimuthIndexAbsolute = azimuthIndexToUpdate - azimuthMin;
        const azimuthIndex1 = PolarMeasureValueMap.UpdateIndex(azimuthsCount, azimuthIndexAbsolute);
        const azimuthIndex2 = PolarMeasureValueMap.UpdateIndex(azimuthsCount, azimuthIndexToUpdate);
        const azimuthInDegrees = (azimuthIndex2 * 360) / azimuthsCount;

        if (azimuthIndex1 < 0) {
            console.warn('### raain-model > Map strange azimuthIndex:', azimuthIndex1);
        }
        if (azimuthInDegrees < 0 || azimuthInDegrees > 360) {
            console.warn('### raain-model > Map strange azimuthInDegrees:', azimuthInDegrees);
        }

        return {azimuthIndex: azimuthIndex1, azimuthInDegrees};
    }

    protected updatedEdge(
        edgeIndexToUpdate: number,
        measureValuePolarContainer?: MeasureValuePolarContainer,
        options?: {
            reverse: boolean;
        }
    ) {
        let distance = this.polarMeasureValue.getDefaultDistance();
        if (measureValuePolarContainer) {
            distance = measureValuePolarContainer.distance;
        }
        const edgeMin =
            typeof this.buildPolarFilter?.edgeMin !== 'undefined'
                ? this.buildPolarFilter.edgeMin
                : 0;

        let edgeIndex = edgeIndexToUpdate - edgeMin;
        let distanceIndex = edgeIndexToUpdate + 1;
        if (options?.reverse) {
            edgeIndex = edgeIndexToUpdate + edgeMin;
            distanceIndex = edgeIndex + 1;
        }

        const distanceInMeters = distance * distanceIndex;
        // if (distanceInMeters < 0) {
        // console.warn('### raain-model > Map strange edgeIndex:', edgeIndex, distanceInMeters);
        // }

        edgeIndex = Math.round(edgeIndex);

        return {edgeIndex, distanceInMeters};
    }

    protected iterateOnEachAzimuth(
        azimuthMin: number,
        azimuthMax: number,
        edgeMin: number,
        edgeMax: number,
        onEachValue: (
            polarValue: PolarValue,
            azimuthIndex: number,
            edgeIndex: number,
            valueSetter: (newValue: number) => void
        ) => void | Promise<void>
    ) {
        const promises: Promise<void>[] = [];
        let isAsync = false;

        for (const measureValuePolarContainer of this.builtMeasureValuePolarContainers) {
            const azimuthInDegrees = measureValuePolarContainer.azimuth;
            const polarEdges = measureValuePolarContainer.polarEdges;
            const azimuthAbsoluteIndex = Math.round(
                (azimuthInDegrees * this.polarMeasureValue.getAzimuthsCount()) / 360
            );
            if (azimuthAbsoluteIndex < azimuthMin) {
                continue;
            }
            if (azimuthMax < azimuthAbsoluteIndex) {
                break;
            }

            for (const [edgeIndex, value] of polarEdges.entries()) {
                const updated = this.updatedEdge(edgeIndex, measureValuePolarContainer, {
                    reverse: true,
                });
                const edgeAbsoluteIndex = updated.edgeIndex;
                const distanceInMeters = updated.distanceInMeters;
                if (edgeAbsoluteIndex < edgeMin) {
                    continue;
                }
                if (edgeMax < edgeAbsoluteIndex) {
                    break;
                }

                const valueSetter = (newValue: number) => {
                    polarEdges[edgeIndex] = newValue;
                };

                const result = onEachValue(
                    new PolarValue({
                        value,
                        polarAzimuthInDegrees: azimuthInDegrees,
                        polarDistanceInMeters: distanceInMeters,
                    }),
                    azimuthAbsoluteIndex,
                    edgeAbsoluteIndex,
                    valueSetter
                );

                if (result instanceof Promise) {
                    isAsync = true;
                    promises.push(result);
                }
            }
        }

        if (isAsync) {
            return Promise.all(promises).then(() => {});
        }
    }

    protected iterateOnEachEdge(
        azimuthMin: number,
        azimuthMax: number,
        edgeMin: number,
        edgeMax: number,
        onEachValue: (
            polarValue: PolarValue,
            azimuthIndex: number,
            edgeIndex: number,
            valueSetter: (newValue: number) => void
        ) => void | Promise<void>
    ) {
        const promises: Promise<void>[] = [];
        let isAsync = false;

        for (let edge = edgeMin; edge <= edgeMax; edge++) {
            for (const measureValuePolarContainer of this.builtMeasureValuePolarContainers) {
                const azimuthInDegrees = measureValuePolarContainer.azimuth;
                const polarEdges = measureValuePolarContainer.polarEdges;
                const azimuthAbsoluteIndex = Math.round(
                    (azimuthInDegrees * this.polarMeasureValue.getAzimuthsCount()) / 360
                );
                if (azimuthAbsoluteIndex < azimuthMin) {
                    continue;
                }
                if (azimuthMax < azimuthAbsoluteIndex) {
                    break;
                }

                for (const [edgeIndex, value] of polarEdges.entries()) {
                    const updated = this.updatedEdge(edgeIndex, measureValuePolarContainer, {
                        reverse: true,
                    });
                    const edgeAbsoluteIndex = updated.edgeIndex;
                    const distanceInMeters = updated.distanceInMeters;

                    if (edge === edgeAbsoluteIndex) {
                        const valueSetter = (newValue: number) => {
                            polarEdges[edgeIndex] = newValue;
                        };

                        const result = onEachValue(
                            new PolarValue({
                                value,
                                polarAzimuthInDegrees: azimuthInDegrees,
                                polarDistanceInMeters: distanceInMeters,
                            }),
                            azimuthAbsoluteIndex,
                            edgeAbsoluteIndex,
                            valueSetter
                        );
                        if (result instanceof Promise) {
                            isAsync = true;
                            promises.push(result);
                        }
                    }
                    if (edge < edgeAbsoluteIndex) {
                        break;
                    }
                }
            }
        }

        if (isAsync) {
            return Promise.all(promises).then(() => {});
        }
    }
}
