import {MeasureValuePolarContainer} from './MeasureValuePolarContainer';
import {PolarValue} from './PolarValue';
import {PolarMeasureValue} from './PolarMeasureValue';
import {PolarFilter, PolarFilterZone} from './PolarFilter';

const shouldLogPerf = false;

/**
 * PolarMeasureValue Map tools to optimize get/set
 */
export class PolarMeasureValueMap {
    protected builtMeasureValuePolarContainers: MeasureValuePolarContainer[] = [];
    protected readonly buildTimeMs: number = 0;
    protected readonly defaultValue = 0;

    constructor(
        public polarMeasureValue: PolarMeasureValue,
        public buildPolarFilter: PolarFilter = new PolarFilter()
    ) {
        const start = Date.now();
        this.buildFromPolar();
        this.buildTimeMs = Date.now() - start;

        if (shouldLogPerf && this.buildTimeMs > 50) {
            const sourceAz = this.polarMeasureValue?.getAzimuthsCount() || 0;
            const sourceEdges = this.polarMeasureValue?.getPolarEdgesCount() || 0;
            const builtAz = this.builtMeasureValuePolarContainers.length;
            const builtCells = this.countPolar();
            console.log(
                `(raain-model) perf: PolarMeasureValueMap.constructor ` +
                    `buildTime=${this.buildTimeMs}ms ` +
                    `source=[${sourceAz}az x ${sourceEdges}edges] ` +
                    `built=[${builtAz}az x ${builtCells}cells]`
            );
        }
    }

    static Duplicate(polarMeasureValueMap: PolarMeasureValueMap): PolarMeasureValueMap {
        const pol = new PolarMeasureValueMap(null);
        pol.polarMeasureValue = new PolarMeasureValue(
            polarMeasureValueMap.polarMeasureValue as any
        );
        pol.builtMeasureValuePolarContainers =
            polarMeasureValueMap.builtMeasureValuePolarContainers;
        pol.buildPolarFilter = new PolarFilter({
            zones: polarMeasureValueMap.buildPolarFilter?.zones,
        });
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
            console.warn('### raain-model > index ? ', newIndex);
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
            nullValues: false,
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
            if (!measureValuePolarContainer?.getFiltered) {
                console.warn(
                    '### raain-model > missing measureValuePolarContainer?.getFiltered ? '
                );
                continue;
            }
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

    getPolarValue(json: {azimuthIndex: number; edgeIndex: number}): PolarValue | null {
        let edgeValue = this.defaultValue;
        let distanceInMetersFound = 0;
        const {azimuthIndex, azimuthInDegrees} = this.updatedAzimuth(json.azimuthIndex);
        if (azimuthIndex >= 0) {
            if (azimuthIndex >= this.builtMeasureValuePolarContainers.length) {
                // throw new Error('Impossible to getPolarValue azimuth from ' + JSON.stringify(json));
                // console.warn('### raain-model > getPolarValue Impossible from azimuth', json);
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
                    // console.warn('### raain-model > getPolarValue Impossible from edge ', json);
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
        if (azimuthIndex < 0 || azimuthIndex >= this.builtMeasureValuePolarContainers.length) {
            throw new Error(
                `Impossible to set ${JSON.stringify(json)} in this optimized polar structure`
            );
        }

        const measureValuePolarContainer = this.builtMeasureValuePolarContainers[azimuthIndex];
        const {edgeIndex, distanceInMeters} = this.updatedEdge(
            json.edgeIndex,
            measureValuePolarContainer
        );
        if (
            !measureValuePolarContainer?.polarEdges ||
            edgeIndex < 0 ||
            edgeIndex >= measureValuePolarContainer.polarEdges.length
        ) {
            throw new Error(
                `Impossible to set ${JSON.stringify(json)} in this optimized polar structure`
            );
        }

        measureValuePolarContainer.polarEdges[edgeIndex] = json.value;

        return new PolarValue({
            value: json.value,
            polarAzimuthInDegrees: measureValuePolarContainer.azimuth,
            polarDistanceInMeters: distanceInMeters,
        });
    }

    // Iterate over polar values with optional filtering
    // - iterateOnEachEdge=false (default): azimuth-first (radial lines), more efficient
    // - iterateOnEachEdge=true: edge-first (concentric circles), useful for ring-based operations
    // - bypass=true: iterate ONLY on zones stored in buildPolarFilter (skips everything else)
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
            minExcludedValue?: number; // Skip values <= minExcludedValue (e.g., 0 to skip zeros)
            bypass?: boolean; // When true, iterate only on zones from buildPolarFilter
        }
    ): void | Promise<void> {
        const start = Date.now();

        const useBypass = options?.bypass && this.buildPolarFilter?.zones?.length > 0;

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

        const mode = useBypass
            ? options?.iterateOnEachEdge
                ? 'bypass-zones-edge-first'
                : 'bypass-zones'
            : options?.iterateOnEachEdge
              ? 'edge-first'
              : 'azimuth-first';
        const totalCells = this.countPolar();
        let callCount = 0;

        const wrappedCallback = (
            polarValue: PolarValue,
            azimuthIndex: number,
            edgeIndex: number,
            valueSetter: (newValue: number) => void
        ) => {
            callCount++;
            return onEachValue(polarValue, azimuthIndex, edgeIndex, valueSetter);
        };

        const logPerf = () => {
            if (!shouldLogPerf) {
                return;
            }

            const timeMs = Date.now() - start;
            if (timeMs > 50) {
                const cellsPerMs = timeMs > 0 ? Math.round(totalCells / timeMs) : 0;
                console.log(
                    `(raain-model) perf: PolarMeasureValueMap.iterate ` +
                        `time=${timeMs}ms ` +
                        `cells=${totalCells} ` +
                        `callCount=${callCount} ` +
                        `rate=${cellsPerMs}cells/ms ` +
                        `mode=${mode} ` +
                        `filter=[az:${azimuthMin}-${azimuthMax}, edge:${edgeMin}-${edgeMax}]`
                );
            }
        };

        const minExcludedValue = options?.minExcludedValue;

        let result: void | Promise<void>;
        if (useBypass) {
            result = this.iterateOnZones(
                this.buildPolarFilter.zones,
                wrappedCallback,
                minExcludedValue,
                options?.iterateOnEachEdge
            );
        } else if (options?.iterateOnEachEdge) {
            result = this.iterateOnEachEdge(
                azimuthMin,
                azimuthMax,
                edgeMin,
                edgeMax,
                wrappedCallback,
                minExcludedValue
            );
        } else {
            result = this.iterateOnEachAzimuth(
                azimuthMin,
                azimuthMax,
                edgeMin,
                edgeMax,
                wrappedCallback,
                minExcludedValue
            );
        }

        if (result instanceof Promise) {
            return result.then(() => {
                logPerf();
            });
        } else {
            logPerf();
        }
    }

    countPolar() {
        return this.builtMeasureValuePolarContainers.reduce((p, c) => {
            return p + (c.getPolarEdgesCount ? c.getPolarEdgesCount() : c.polarEdges.length);
        }, 0);
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
                polarEdges.push(polarValue?.value ?? this.defaultValue);
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

    // Builds optimized containers from source PolarMeasureValue
    // NOTE: Creates FULL edge arrays from edgeMin to edgeMax (based on polarEdgesCount),
    // even if source containers have fewer edges. This means sparse edge data
    // becomes dense after building, impacting iteration performance.
    // Potential optimization: preserve source container edge bounds instead of expanding.
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

        const azimuthsInDegrees = this.polarMeasureValue.getAzimuthsInDegrees();
        let azimuthIndex = -1;
        for (const azimuthInDegrees of azimuthsInDegrees) {
            azimuthIndex++;
            if (azimuthIndex < azimuthMin || azimuthIndex > azimuthMax) {
                continue;
            }

            const polarEdges = [];
            for (let edgeIndex = edgeMin; edgeIndex <= edgeMax; edgeIndex++) {
                const distanceInMeters = defaultDistanceBetweenInEdgeInMeters * (edgeIndex + 1);
                const polarValue = this.polarMeasureValue.getPolarValue({
                    azimuthInDegrees,
                    distanceInMeters,
                    rounded: true,
                });
                if (!polarValue) {
                    console.warn(
                        `### raain-model > polarValue mismatch on az:${azimuthInDegrees}, set ${this.defaultValue} as default`
                    );
                }
                polarEdges.push(polarValue?.value ?? this.defaultValue);
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

        // Log if significant data expansion occurred
        if (shouldLogPerf) {
            const sourceContainers = this.polarMeasureValue.getPolars();
            const sourceActualCells = sourceContainers.reduce(
                (sum, c) => sum + c.polarEdges.length,
                0
            );
            const builtCells = builtMeasureValuePolarContainers.reduce(
                (sum, c) => sum + c.polarEdges.length,
                0
            );
            const expansionRatio = sourceActualCells > 0 ? builtCells / sourceActualCells : 0;

            if (expansionRatio > 2 && builtCells > 10000) {
                console.log(
                    `(raain-model) perf: PolarMeasureValueMap.buildFromPolar ` +
                        `expansion=${expansionRatio.toFixed(1)}x ` +
                        `source=${sourceActualCells}cells(${sourceContainers.length}az) ` +
                        `built=${builtCells}cells(${builtMeasureValuePolarContainers.length}az) ` +
                        `filter=[az:${azimuthMin}-${azimuthMax}, edge:${edgeMin}-${edgeMax}]`
                );
            }
        }
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

        return {azimuthIndex: azimuthIndex1, azimuthInDegrees, azimuthIndexAbsolute};
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

    // Azimuth-first iteration (default): iterates radial lines one by one
    // Order: Az0-Edge0, Az0-Edge1, Az0-Edge2, ..., Az1-Edge0, Az1-Edge1, ...
    // Performance: O(containers * edgeRange) - direct index access, no inner scan
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
        ) => void | Promise<void>,
        minExcludedValue?: number
    ) {
        const promises: Promise<void>[] = [];
        let isAsync = false;
        const hasMinFilter = typeof minExcludedValue === 'number';

        const buildEdgeMin =
            typeof this.buildPolarFilter?.edgeMin !== 'undefined'
                ? this.buildPolarFilter.edgeMin
                : 0;

        let azimuthAbsoluteIndex = -1;
        let updatedAzimuth = -1;
        while (updatedAzimuth < 0 && azimuthAbsoluteIndex < azimuthMax) {
            const upd = this.updatedAzimuth(++azimuthAbsoluteIndex);
            updatedAzimuth = upd.azimuthIndexAbsolute;
        }

        azimuthAbsoluteIndex--;
        for (const measureValuePolarContainer of this.builtMeasureValuePolarContainers) {
            azimuthAbsoluteIndex++;
            if (azimuthAbsoluteIndex < azimuthMin) {
                continue;
            }
            if (azimuthMax < azimuthAbsoluteIndex) {
                break;
            }

            const azimuthInDegrees = measureValuePolarContainer.azimuth;
            const polarEdges = measureValuePolarContainer.polarEdges;
            const distance =
                measureValuePolarContainer.distance || this.polarMeasureValue.getDefaultDistance();

            // Direct index range: convert absolute edge range to local indices
            const localStart = Math.max(edgeMin - buildEdgeMin, 0);
            const localEnd = Math.min(edgeMax - buildEdgeMin, polarEdges.length - 1);

            for (let i = localStart; i <= localEnd; i++) {
                const value = polarEdges[i];
                if (hasMinFilter && value <= minExcludedValue) {
                    continue;
                }

                const edgeAbsoluteIndex = i + buildEdgeMin;
                const distanceInMeters = (edgeAbsoluteIndex + 1) * distance;

                const valueSetter = (newValue: number) => {
                    polarEdges[i] = newValue;
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

    // Edge-first iteration: iterates concentric circles one by one
    // Order: Az0-Edge0, Az1-Edge0, Az2-Edge0, ..., Az0-Edge1, Az1-Edge1, ...
    // Performance: O(edgeRange * containers) - direct index access per container
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
        ) => void | Promise<void>,
        minExcludedValue?: number
    ) {
        const promises: Promise<void>[] = [];
        let isAsync = false;
        const hasMinFilter = typeof minExcludedValue === 'number';

        const buildEdgeMin =
            typeof this.buildPolarFilter?.edgeMin !== 'undefined'
                ? this.buildPolarFilter.edgeMin
                : 0;

        // Compute azimuth offset once
        let azStartOffset = -1;
        let updatedAzimuth = -1;
        while (updatedAzimuth < 0 && azStartOffset < azimuthMax) {
            const upd = this.updatedAzimuth(++azStartOffset);
            updatedAzimuth = upd.azimuthIndexAbsolute;
        }
        azStartOffset--;

        for (let edge = edgeMin; edge <= edgeMax; edge++) {
            const localEdgeIdx = edge - buildEdgeMin;

            let azimuthAbsoluteIndex = azStartOffset;
            for (const measureValuePolarContainer of this.builtMeasureValuePolarContainers) {
                azimuthAbsoluteIndex++;
                if (azimuthAbsoluteIndex < azimuthMin) {
                    continue;
                }
                if (azimuthMax < azimuthAbsoluteIndex) {
                    break;
                }

                const polarEdges = measureValuePolarContainer.polarEdges;
                if (localEdgeIdx < 0 || localEdgeIdx >= polarEdges.length) {
                    continue;
                }

                const value = polarEdges[localEdgeIdx];
                if (hasMinFilter && value <= minExcludedValue) {
                    continue;
                }

                const distance =
                    measureValuePolarContainer.distance ||
                    this.polarMeasureValue.getDefaultDistance();
                const distanceInMeters = (edge + 1) * distance;

                const valueSetter = (newValue: number) => {
                    polarEdges[localEdgeIdx] = newValue;
                };

                const result = onEachValue(
                    new PolarValue({
                        value,
                        polarAzimuthInDegrees: measureValuePolarContainer.azimuth,
                        polarDistanceInMeters: distanceInMeters,
                    }),
                    azimuthAbsoluteIndex,
                    edge,
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

    // Zone-based iteration: only visits cells within defined zones, with deduplication
    // Direct index mapping (no wrapping) for predictable zone traversal
    // edgeFirst=false (default): azimuth-first per zone
    // edgeFirst=true: edge-first per zone
    protected iterateOnZones(
        zones: PolarFilterZone[],
        onEachValue: (
            polarValue: PolarValue,
            azimuthIndex: number,
            edgeIndex: number,
            valueSetter: (newValue: number) => void
        ) => void | Promise<void>,
        minExcludedValue?: number,
        edgeFirst?: boolean
    ) {
        const promises: Promise<void>[] = [];
        let isAsync = false;
        const hasMinFilter = typeof minExcludedValue === 'number';
        const visited = new Set<number>();

        const globalAzMin = this.buildPolarFilter.azimuthMin ?? 0;
        const globalEdMin = this.buildPolarFilter.edgeMin ?? 0;
        const azimuthsCount = this.polarMeasureValue.getAzimuthsCount();
        const defaultDistance = this.polarMeasureValue.getDefaultDistance();
        const maxEdKey = this.polarMeasureValue.getPolarEdgesCount() + 1;

        const visitCell = (azIdx: number, edIdx: number) => {
            const key = azIdx * maxEdKey + edIdx;
            if (visited.has(key)) {
                return;
            }
            visited.add(key);

            const containerIdx = azIdx - globalAzMin;
            if (containerIdx < 0 || containerIdx >= this.builtMeasureValuePolarContainers.length) {
                return;
            }

            const container = this.builtMeasureValuePolarContainers[containerIdx];
            const polarEdges = container.polarEdges;
            const localEdIdx = edIdx - globalEdMin;
            if (localEdIdx < 0 || localEdIdx >= polarEdges.length) {
                return;
            }

            const value = polarEdges[localEdIdx];
            if (hasMinFilter && value <= minExcludedValue) {
                return;
            }

            const distance = container.distance || defaultDistance;
            const valueSetter = (newValue: number) => {
                polarEdges[localEdIdx] = newValue;
            };

            const result = onEachValue(
                new PolarValue({
                    value,
                    polarAzimuthInDegrees: container.azimuth,
                    polarDistanceInMeters: (edIdx + 1) * distance,
                }),
                azIdx,
                edIdx,
                valueSetter
            );

            if (result instanceof Promise) {
                isAsync = true;
                promises.push(result);
            }
        };

        for (const zone of zones) {
            const azMin = Math.max(zone.azMin ?? 0, 0);
            const azMax = Math.min(zone.azMax ?? azimuthsCount - 1, azimuthsCount - 1);
            const edMin = Math.max(zone.edMin ?? 0, 0);
            const edMax = zone.edMax ?? this.polarMeasureValue.getPolarEdgesCount() - 1;

            if (edgeFirst) {
                for (let edIdx = edMin; edIdx <= edMax; edIdx++) {
                    for (let azIdx = azMin; azIdx <= azMax; azIdx++) {
                        visitCell(azIdx, edIdx);
                    }
                }
            } else {
                for (let azIdx = azMin; azIdx <= azMax; azIdx++) {
                    for (let edIdx = edMin; edIdx <= edMax; edIdx++) {
                        visitCell(azIdx, edIdx);
                    }
                }
            }
        }

        if (isAsync) {
            return Promise.all(promises).then(() => {});
        }
    }
}
