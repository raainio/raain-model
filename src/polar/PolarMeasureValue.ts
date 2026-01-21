import {MeasureValuePolarContainer} from './MeasureValuePolarContainer';
import {IPolarMeasureValue} from './IPolarMeasureValue';
import {PolarValue} from './PolarValue';
import {AbstractPolarMeasureValue} from './AbstractPolarMeasureValue';
import {Tools} from '../utils';

export class PolarMeasureValue implements IPolarMeasureValue {
    protected measureValuePolarContainers: MeasureValuePolarContainer[];
    protected azimuthsCount: number;
    protected polarEdgesCount: number;

    constructor(
        json:
            | {
                  measureValuePolarContainers: MeasureValuePolarContainer[] | string;
                  azimuthsCount?: number;
                  polarEdgesCount?: number;
              }
            | string
    ) {
        if (typeof json === 'string') {
            json = JSON.parse(json) as {
                measureValuePolarContainers: MeasureValuePolarContainer[] | string;
                azimuthsCount: number;
                polarEdgesCount: number;
            };
        }

        if (typeof json.measureValuePolarContainers === 'string') {
            this.setPolarsAsString(json.measureValuePolarContainers);
        } else if (
            json.measureValuePolarContainers instanceof AbstractPolarMeasureValue ||
            json.measureValuePolarContainers instanceof PolarMeasureValue
        ) {
            this.setPolarsAsContainer(json.measureValuePolarContainers.getPolars());
        } else {
            this.setPolarsAsContainer(json.measureValuePolarContainers);
        }

        if (!(json?.azimuthsCount >= 0) || !(json?.polarEdgesCount >= 0)) {
            // throw new Error('PolarMeasureValue needs valid azimuthsCount & polarEdgesCount');
            this.countUnknown();
        } else {
            this.azimuthsCount = json.azimuthsCount;
            this.polarEdgesCount = json.polarEdgesCount;
        }
    }

    static SimpleHash(toHash: string): string {
        let hash = 0;
        if (toHash.length === 0) {
            return hash.toString();
        }

        for (let i = 0; i < toHash.length; i++) {
            const char = toHash.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash = hash & hash;
        }

        return hash.toString();
    }

    getAzimuthsCount(): number {
        if (this.azimuthsCount < 0) {
            this.count();
        }
        return this.azimuthsCount;
    }

    getPolarEdgesCount(): number {
        if (this.polarEdgesCount < 0) {
            this.count();
        }
        return this.polarEdgesCount;
    }

    getPolarsStringified(): string {
        return JSON.stringify(this.measureValuePolarContainers);
    }

    getPolars(): MeasureValuePolarContainer[] {
        return this.measureValuePolarContainers;
    }

    setPolarsAsString(s: string): void {
        try {
            let polars = JSON.parse(s);

            if (polars && polars.measureValuePolarContainers) {
                polars = polars.measureValuePolarContainers;
            }

            if (typeof polars === 'string') {
                polars = JSON.parse(polars);
            }

            this.setContainersAndSortThemByAzimuth(polars);
        } catch (e) {
            // console.warn('setPolarsAsString pb: ', e, typeof s, s);
            this.setContainersAndSortThemByAzimuth([]);
        }

        this.countUnknown();
    }

    setPolarsAsContainer(
        measureValuePolarContainers: MeasureValuePolarContainer[],
        options = {resetCount: true}
    ): void {
        let parsed: any = measureValuePolarContainers ? measureValuePolarContainers : [];
        if (!('length' in parsed)) {
            parsed = [];
        }
        this.setContainersAndSortThemByAzimuth(parsed);

        if (options.resetCount) {
            this.countUnknown();
        }
    }

    getPolarValue(json: {
        azimuthInDegrees: number;
        distanceInMeters: number;
        rounded?: boolean;
    }): PolarValue {
        if (!this.validateAzimuth(json.azimuthInDegrees, 'getPolarValue', json.rounded)) {
            return null;
        }

        let edgeValue = 0;
        let distance = this.getDefaultDistance();
        let polarAzimuthInDegrees = json.azimuthInDegrees;
        const polarDistanceInMeters = json.distanceInMeters;

        const measureValuePolarContainersFound = this.findContainersByAzimuth(
            json.azimuthInDegrees,
            json.rounded
        );
        if (measureValuePolarContainersFound.length === 1) {
            const measureValuePolarContainer = measureValuePolarContainersFound[0];
            distance = measureValuePolarContainer.distance;
            const edgeIndex = this.calculateEdgeIndex(
                json.distanceInMeters,
                distance,
                measureValuePolarContainer.edgeOffset
            );
            polarAzimuthInDegrees = measureValuePolarContainer.azimuth;

            if (0 <= edgeIndex && edgeIndex < measureValuePolarContainer.polarEdges.length) {
                edgeValue = measureValuePolarContainer.polarEdges[edgeIndex];
            }
        } else {
            return null;
        }

        return new PolarValue({
            value: edgeValue,
            polarAzimuthInDegrees,
            polarDistanceInMeters,
        });
    }

    setPolarValue(json: {
        azimuthInDegrees: number;
        distanceInMeters: number;
        value: number;
        rounded?: boolean;
    }): void {
        if (!this.validateAzimuth(json.azimuthInDegrees, 'setPolarValue', json.rounded)) {
            return;
        }

        let distance = this.getDefaultDistance();
        const measureValuePolarContainersFound = this.findContainersByAzimuth(
            json.azimuthInDegrees,
            json.rounded
        );

        if (measureValuePolarContainersFound.length === 1) {
            const measureValuePolarContainer = measureValuePolarContainersFound[0];
            distance = measureValuePolarContainer.distance;
            const edgeIndex = this.calculateEdgeIndex(
                json.distanceInMeters,
                distance,
                measureValuePolarContainer.edgeOffset
            );

            if (0 <= edgeIndex && edgeIndex < measureValuePolarContainer.polarEdges.length) {
                measureValuePolarContainer.polarEdges[edgeIndex] = json.value;
            } else {
                console.warn('### raain-model > setPolarValue : extending polarEdges');
                let diff = edgeIndex - measureValuePolarContainer.polarEdges.length;
                if (edgeIndex < 0) {
                    diff = -1 - edgeIndex;
                    measureValuePolarContainer.edgeOffset += edgeIndex;
                }

                const arrayWithNullValuesToAdd = new Array(diff).fill(0);

                if (edgeIndex < 0) {
                    measureValuePolarContainer.polarEdges = [json.value].concat(
                        arrayWithNullValuesToAdd.concat(measureValuePolarContainer.polarEdges)
                    );
                } else if (edgeIndex > 0) {
                    measureValuePolarContainer.polarEdges =
                        measureValuePolarContainer.polarEdges.concat(
                            arrayWithNullValuesToAdd.concat([json.value])
                        );
                }
            }
        } else if (measureValuePolarContainersFound.length === 0) {
            console.warn('### raain-model > setPolarValue : extending measureValuePolarContainers');
            const polarEdges = [json.value];
            const edgeOffset = json.distanceInMeters / distance - 1;
            this.measureValuePolarContainers.push(
                new MeasureValuePolarContainer({
                    azimuth: json.azimuthInDegrees,
                    distance,
                    polarEdges,
                    edgeOffset,
                })
            );
        }
    }

    async iterate(
        onEachValue: (
            polarValue: PolarValue,
            azimuthIndex: number,
            edgeIndex: number,
            valueSetter: (newValue: number) => void
        ) => Promise<void>
    ) {
        let azimuthIndex = 0;
        for (const measureValuePolarContainer of this.measureValuePolarContainers) {
            const azimuth = measureValuePolarContainer.azimuth;
            const distance = measureValuePolarContainer.distance;
            const polarEdges = measureValuePolarContainer.polarEdges;

            // azimuthIndex = (azimuth * this.getAzimuthsCount()) / 360;
            for (const [edgeIndex, value] of polarEdges.entries()) {
                const edgeAbsoluteIndex = edgeIndex + measureValuePolarContainer.edgeOffset;

                const valueSetter = (newValue: number) => {
                    polarEdges[edgeIndex] = newValue;
                };

                await onEachValue(
                    new PolarValue({
                        value,
                        polarAzimuthInDegrees: azimuth,
                        polarDistanceInMeters: distance * (edgeAbsoluteIndex + 1),
                    }),
                    azimuthIndex,
                    edgeAbsoluteIndex,
                    valueSetter
                );
            }
            azimuthIndex++;
        }
    }

    public toJSON() {
        return {
            measureValuePolarContainers: this.measureValuePolarContainers,
            azimuthsCount: this.getAzimuthsCount(),
            polarEdgesCount: this.getPolarEdgesCount(),
        };
    }

    public toJSONWithPolarStringified() {
        return {
            measureValuePolarContainers: this.getPolarsStringified(),
            azimuthsCount: this.getAzimuthsCount(),
            polarEdgesCount: this.getPolarEdgesCount(),
        };
    }

    public getFiltered(
        options = {
            nullValues: true,
            ordered: false,
        }
    ): PolarMeasureValue {
        const azimuthsCount = this.getAzimuthsCount();
        const polarEdgesCount = this.getPolarEdgesCount();

        let measureValuePolarContainers = [];
        for (const measureValuePolarContainer of this.measureValuePolarContainers) {
            if (!measureValuePolarContainer) {
                console.warn('### raain-model > missing measureValuePolarContainer ? ');
                continue;
            }
            let filteredMeasureValuePolarContainer = measureValuePolarContainer;
            if (measureValuePolarContainer.getFiltered) {
                filteredMeasureValuePolarContainer =
                    measureValuePolarContainer.getFiltered(options);
            }
            measureValuePolarContainers.push(filteredMeasureValuePolarContainer);
        }

        if (options.ordered) {
            measureValuePolarContainers = measureValuePolarContainers.sort(
                (a, b) => a.azimuth - b.azimuth
            );
        }

        return new PolarMeasureValue({measureValuePolarContainers, azimuthsCount, polarEdgesCount});
    }

    public getValuesCount(): number {
        return this.getAzimuthsCount() * this.getPolarEdgesCount();
    }

    public getNotNullValuesCount(): number {
        let count = 0;
        for (const [a, measureValuePolarContainer] of this.measureValuePolarContainers.entries()) {
            count += measureValuePolarContainer.getNotNullValuesCount();
        }
        return count;
    }

    public getDefaultDistance() {
        let distance = 1000;
        if (this.measureValuePolarContainers.length > 0) {
            distance = this.measureValuePolarContainers[0].distance;
        }
        return distance;
    }

    public getHash(hash?: (arg0: any) => number | string): string {
        if (!hash) {
            return PolarMeasureValue.SimpleHash(this.getPolarsStringified());
        }
        return '' + hash(this.getPolars());
    }

    public getMinMaxValues(): {min: number; max: number} | null {
        const containers = this.measureValuePolarContainers;
        if (containers.length === 0) {
            return null;
        }

        let allValues: number[] = [];
        for (const container of containers) {
            allValues = allValues.concat(
                container.polarEdges.filter((v) => v !== null && v !== undefined)
            );
        }

        return Tools.calculateMinMax(allValues);
    }

    public getAzimuthsInDegrees() {
        return this.measureValuePolarContainers.map((c) => c.azimuth);
    }

    protected count() {
        const measureValuePolarContainers = this.measureValuePolarContainers;
        this.azimuthsCount = measureValuePolarContainers.length;
        if (this.azimuthsCount > 0) {
            let maxLength = 0;
            for (const container of measureValuePolarContainers) {
                const containerLength = container.polarEdges.length + container.edgeOffset;
                if (containerLength > maxLength) {
                    maxLength = containerLength;
                }
            }
            this.polarEdgesCount = maxLength;
        } else {
            this.polarEdgesCount = 0;
        }
    }

    protected countUnknown() {
        this.azimuthsCount = -1;
        this.polarEdgesCount = -1;
    }

    private validateAzimuth(
        azimuthInDegrees: number,
        methodName: string,
        rounded: boolean
    ): boolean {
        if (!rounded) {
            if (azimuthInDegrees < 0 || azimuthInDegrees > 360) {
                console.warn(
                    `### raain-model > ${methodName} : strange azimuth:`,
                    azimuthInDegrees
                );
                return false;
            }
        } else {
            if (Math.round(azimuthInDegrees) < 0 || Math.round(azimuthInDegrees) > 360) {
                console.warn(
                    `### raain-model > ${methodName} : strange azimuth:`,
                    azimuthInDegrees
                );
                return false;
            }
        }
        return true;
    }

    private findContainersByAzimuth(
        azimuthInDegrees: number,
        rounded?: boolean
    ): MeasureValuePolarContainer[] {
        const roundPrecision = 10;
        return this.measureValuePolarContainers.filter((c) => {
            if (!rounded) {
                return c.azimuth === azimuthInDegrees;
            } else {
                return (
                    Math.round(c.azimuth * roundPrecision) / roundPrecision ===
                    Math.round(azimuthInDegrees * roundPrecision) / roundPrecision
                );
            }
        });
    }

    private calculateEdgeIndex(
        stepDistanceInMeters: number,
        containerDistance: number,
        edgeOffset: number
    ) {
        return stepDistanceInMeters / containerDistance - 1 - edgeOffset;
    }

    private setContainersAndSortThemByAzimuth(
        measureValuePolarContainers: MeasureValuePolarContainer[]
    ) {
        this.measureValuePolarContainers = measureValuePolarContainers
            .map((c) => new MeasureValuePolarContainer(c))
            .sort((c1, c2) => c1.azimuth - c2.azimuth);
    }
}
