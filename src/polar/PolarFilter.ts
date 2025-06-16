export class PolarFilter {
    azimuthMin: number;
    azimuthMax: number;
    edgeMin: number;
    edgeMax: number;

    constructor(json?: {
        azimuthMin?: number;
        azimuthMax?: number;
        edgeMin?: number;
        edgeMax?: number;
    }) {
        if (typeof json?.azimuthMin !== 'undefined') {
            this.azimuthMin = json.azimuthMin;
        }
        if (typeof json?.azimuthMax !== 'undefined') {
            this.azimuthMax = json.azimuthMax;
        }
        if (typeof json?.edgeMin !== 'undefined') {
            this.edgeMin = json.edgeMin;
        }
        if (typeof json?.edgeMax !== 'undefined') {
            this.edgeMax = json.edgeMax;
        }
    }

    protected static min(a: number, b: number): number {
        if (typeof a === 'undefined') {
            return b;
        }
        if (typeof b === 'undefined') {
            return a;
        }
        return Math.min(a, b);
    }

    protected static max(a: number, b: number): number {
        if (typeof a === 'undefined') {
            return b;
        }
        if (typeof b === 'undefined') {
            return a;
        }
        return Math.max(a, b);
    }

    merging(polarFilter?: PolarFilter): PolarFilter {
        return new PolarFilter({
            azimuthMin: PolarFilter.max(polarFilter?.azimuthMin, this.azimuthMin),
            azimuthMax: PolarFilter.min(polarFilter?.azimuthMax, this.azimuthMax),
            edgeMin: PolarFilter.max(polarFilter?.edgeMin, this.edgeMin),
            edgeMax: PolarFilter.min(polarFilter?.edgeMax, this.edgeMax),
        });
    }

    equal(polarFilter: PolarFilter): boolean {
        return (
            this.azimuthMin === polarFilter.azimuthMin &&
            this.azimuthMax === polarFilter.azimuthMax &&
            this.edgeMin === polarFilter.edgeMin &&
            this.edgeMax === polarFilter.edgeMax
        );
    }
}
