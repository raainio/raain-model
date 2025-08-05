import {MeasureValuePolarContainer} from './MeasureValuePolarContainer';
import {IPolarMeasureValue} from './IPolarMeasureValue';
import {PolarValue} from './PolarValue';
import {AbstractPolarMeasureValue} from './AbstractPolarMeasureValue';

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
        return JSON.stringify(this.getPolars());
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

            this.measureValuePolarContainers = polars.map(
                (convertedPolar) => new MeasureValuePolarContainer(convertedPolar)
            );
        } catch (e) {
            // console.warn('setPolarsAsString pb: ', e, typeof s, s);
            this.measureValuePolarContainers = [];
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
        this.measureValuePolarContainers = parsed;

        if (options.resetCount) {
            this.countUnknown();
        }
    }

    getPolarValue(json: {azimuthInDegrees: number; distanceInMeters: number}): PolarValue {
        if (json.azimuthInDegrees < 0 || json.azimuthInDegrees > 360) {
            console.warn(
                '### raain-model > getPolarValue : strange azimuth:',
                json.azimuthInDegrees
            );
            return null;
        }

        let edgeValue = 0;
        let distance = this.getDefaultDistance();

        const measureValuePolarContainersFound = this.measureValuePolarContainers.filter(
            (c) => c.azimuth === json.azimuthInDegrees
        );
        if (measureValuePolarContainersFound.length === 1) {
            const measureValuePolarContainer = measureValuePolarContainersFound[0];
            distance = measureValuePolarContainer.distance;
            const edgeIndex =
                json.distanceInMeters / distance - 1 - measureValuePolarContainer.edgeOffset;

            if (0 <= edgeIndex && edgeIndex < measureValuePolarContainer.polarEdges.length) {
                edgeValue = measureValuePolarContainer.polarEdges[edgeIndex];
            }
        }

        return new PolarValue({
            value: edgeValue,
            polarAzimuthInDegrees: json.azimuthInDegrees,
            polarDistanceInMeters: json.distanceInMeters,
        });
    }

    setPolarValue(json: {azimuthInDegrees: number; distanceInMeters: number; value: number}): void {
        if (json.azimuthInDegrees < 0 || json.azimuthInDegrees > 360) {
            console.warn(
                '### raain-model > setPolarValue : strange azimuth:',
                json.azimuthInDegrees
            );
            return null;
        }

        let distance = this.getDefaultDistance();
        const azimuth = json.azimuthInDegrees;
        const found = this.measureValuePolarContainers.filter((c) => c.azimuth === azimuth);
        if (found.length === 1) {
            const measureValuePolarContainer = found[0];
            distance = measureValuePolarContainer.distance;
            const edgeIndex =
                json.distanceInMeters / distance - 1 - measureValuePolarContainer.edgeOffset;

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
        } else if (found.length === 0) {
            console.warn('### raain-model > setPolarValue : extending measureValuePolarContainers');
            const polarEdges = [json.value];
            const edgeOffset = json.distanceInMeters / distance - 1;
            this.measureValuePolarContainers.push(
                new MeasureValuePolarContainer({azimuth, distance, polarEdges, edgeOffset})
            );
        }
    }

    iterate(
        onEachValue: (
            polarValue: PolarValue,
            azimuthIndex: number,
            edgeIndex: number,
            valueSetter: (newValue: number) => void
        ) => void
    ) {
        for (const measureValuePolarContainer of this.measureValuePolarContainers) {
            const azimuth = measureValuePolarContainer.azimuth;
            const distance = measureValuePolarContainer.distance;
            const polarEdges = measureValuePolarContainer.polarEdges;

            const azimuthIndex = (azimuth * this.getAzimuthsCount()) / 360;
            for (const [edgeIndex, value] of polarEdges.entries()) {
                const edgeAbsoluteIndex = edgeIndex + measureValuePolarContainer.edgeOffset;

                const valueSetter = (newValue: number) => {
                    polarEdges[edgeIndex] = newValue;
                };

                onEachValue(
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
        }
    }

    public toJSON() {
        return {
            measureValuePolarContainers: this.getPolars(),
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
            let filteredMeasureValuePolarContainer = measureValuePolarContainer;
            if (
                measureValuePolarContainer.getFiltered &&
                filteredMeasureValuePolarContainer.getNotNullValuesCount
            ) {
                filteredMeasureValuePolarContainer =
                    measureValuePolarContainer.getFiltered(options);
                if (
                    options.nullValues &&
                    filteredMeasureValuePolarContainer.getNotNullValuesCount()
                ) {
                    measureValuePolarContainers.push(filteredMeasureValuePolarContainer);
                }
            } else {
                measureValuePolarContainers.push(filteredMeasureValuePolarContainer);
            }
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
        for (const [a, measureValuePolarContainer] of this.getPolars().entries()) {
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
        const containers = this.getPolars();
        if (containers.length === 0) {
            return null;
        }

        let allValues: number[] = [];
        for (const container of containers) {
            allValues = allValues.concat(
                container.polarEdges.filter((v) => v !== null && v !== undefined)
            );
        }

        if (allValues.length === 0) {
            return null;
        }

        return {
            min: Math.min(...allValues),
            max: Math.max(...allValues),
        };
    }

    protected count() {
        const measureValuePolarContainers = this.getPolars();
        this.azimuthsCount = measureValuePolarContainers.length;
        if (this.azimuthsCount > 0) {
            this.polarEdgesCount = measureValuePolarContainers[0].polarEdges.length;
        } else {
            this.polarEdgesCount = 0;
        }
    }

    protected countUnknown() {
        this.azimuthsCount = -1;
        this.polarEdgesCount = -1;
    }
}
