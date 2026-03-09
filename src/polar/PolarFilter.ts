export interface PolarFilterZone {
    azMin: number;
    azMax: number;
    edMin: number;
    edMax: number;
    metadata?: any;
}

export class PolarFilter {
    zones: PolarFilterZone[];

    constructor(json?: {
        azimuthMin?: number;
        azimuthMax?: number;
        edgeMin?: number;
        edgeMax?: number;
        zones?: PolarFilterZone[];
    }) {
        this.zones = [];
        if (json?.zones?.length) {
            this.zones = json.zones;
        } else if (
            json &&
            (typeof json.azimuthMin !== 'undefined' ||
                typeof json.azimuthMax !== 'undefined' ||
                typeof json.edgeMin !== 'undefined' ||
                typeof json.edgeMax !== 'undefined')
        ) {
            this.zones = [
                {
                    azMin: json.azimuthMin,
                    azMax: json.azimuthMax,
                    edMin: json.edgeMin,
                    edMax: json.edgeMax,
                },
            ];
        }
    }

    // Bounding box getters (backward compat + used by buildFromPolar/iterate)
    get azimuthMin(): number {
        const vals = this.zones.map((z) => z.azMin).filter((v) => typeof v !== 'undefined');
        return vals.length ? Math.min(...vals) : undefined;
    }

    get azimuthMax(): number {
        const vals = this.zones.map((z) => z.azMax).filter((v) => typeof v !== 'undefined');
        return vals.length ? Math.max(...vals) : undefined;
    }

    get edgeMin(): number {
        const vals = this.zones.map((z) => z.edMin).filter((v) => typeof v !== 'undefined');
        return vals.length ? Math.min(...vals) : undefined;
    }

    get edgeMax(): number {
        const vals = this.zones.map((z) => z.edMax).filter((v) => typeof v !== 'undefined');
        return vals.length ? Math.max(...vals) : undefined;
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

    // Intersection semantics: each zone from this × each zone from other
    merging(polarFilter?: PolarFilter): PolarFilter {
        if (!polarFilter?.zones?.length) {
            return new PolarFilter({zones: this.zones.map((z) => ({...z}))});
        }
        if (!this.zones?.length) {
            return new PolarFilter({zones: polarFilter.zones.map((z) => ({...z}))});
        }

        const intersected: PolarFilterZone[] = [];
        for (const za of this.zones) {
            for (const zb of polarFilter.zones) {
                const zone: PolarFilterZone = {
                    azMin: PolarFilter.max(za.azMin, zb.azMin),
                    azMax: PolarFilter.min(za.azMax, zb.azMax),
                    edMin: PolarFilter.max(za.edMin, zb.edMin),
                    edMax: PolarFilter.min(za.edMax, zb.edMax),
                };
                const azValid =
                    typeof zone.azMin === 'undefined' ||
                    typeof zone.azMax === 'undefined' ||
                    zone.azMin <= zone.azMax;
                const edValid =
                    typeof zone.edMin === 'undefined' ||
                    typeof zone.edMax === 'undefined' ||
                    zone.edMin <= zone.edMax;
                if (azValid && edValid) {
                    if (za.metadata || zb.metadata) {
                        zone.metadata = {...za.metadata, ...zb.metadata};
                    }
                    intersected.push(zone);
                }
            }
        }
        return new PolarFilter({zones: intersected});
    }

    equal(polarFilter: PolarFilter): boolean {
        return JSON.stringify(this.zones) === JSON.stringify(polarFilter.zones);
    }
}
