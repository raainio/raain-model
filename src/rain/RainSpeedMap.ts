import {RainSpeed} from './RainSpeed';
import {CartesianTools, CartesianValue, LatLng} from '../cartesian';

/**
 *  api/rains/:rainId/computations/:rainHistoryId/speeds => RainSpeedMap.map => RainSpeed[]
 */
export class RainSpeedMap {
    public rainSpeeds: RainSpeed[];
    public date?: Date;

    constructor(json: {rainSpeeds: RainSpeed[]; date?: Date}) {
        this.rainSpeeds = json.rainSpeeds.map((s) => new RainSpeed(s));
        if (json.date) {
            this.date = new Date(json.date);
        }
    }

    public getRainSpeed(
        point: LatLng | {latitude: number; longitude: number} | {lat: number; lng: number},
        options?: {inEarthMap?: boolean; strictContaining?: boolean}
    ): RainSpeed | undefined {
        // normalize input to numbers
        const normalized = this.normalizePoint(point);
        if (!normalized) {
            return undefined;
        }

        let {lat, lng} = normalized;

        // Apply earth map rounding if requested
        const cartesianTools = new CartesianTools();
        if (options?.inEarthMap) {
            const roundedLatLng = cartesianTools.getLatLngFromEarthMap(new LatLng({lat, lng}));
            lat = roundedLatLng.lat;
            lng = roundedLatLng.lng;
        }

        // retrieve the first RainSpeed whose area contains the point
        for (const rs of this.rainSpeeds ?? []) {
            const rects = rs?.latLngs ?? [];
            const roundedRects = options?.inEarthMap
                ? this.roundRectangles(rects, cartesianTools)
                : rects;

            if (CartesianTools.IsPointInAnyRect(lat, lng, roundedRects)) {
                return rs;
            }
        }

        // If no containing area found and strictContaining is not true, find the closest by center distance
        if (options?.strictContaining !== true) {
            return this.findClosestRainSpeed(lat, lng);
        }

        return undefined;
    }

    public getTrustRatio(
        point?: LatLng | {latitude: number; longitude: number} | {lat: number; lng: number},
        options?: {inEarthMap?: boolean; strictContaining?: boolean}
    ): number {
        // When no point is provided, return average trustRatio of all RainSpeeds
        if (point === undefined) {
            if (!this.rainSpeeds || this.rainSpeeds.length === 0) {
                return 0;
            }
            const sum = this.rainSpeeds.reduce((acc, rs) => acc + (rs.trustRatio ?? 0), 0);
            return sum / this.rainSpeeds.length;
        }

        // When point is provided, use existing logic
        const rainSpeed = this.getRainSpeed(point, options);
        return rainSpeed?.trustRatio ?? 0;
    }

    public transpose(
        cartesianValue: CartesianValue,
        diffInMinutes: number,
        options?: {inEarthMap?: boolean; strictContaining?: boolean}
    ) {
        // Use getRainSpeed to find the appropriate RainSpeed for this point
        const rainSpeed = this.getRainSpeed(cartesianValue, options);

        if (rainSpeed) {
            return rainSpeed.transpose(cartesianValue, diffInMinutes, options);
        }

        // No RainSpeed found - handle fallback based on inEarthMap option
        if (!options?.inEarthMap) {
            return cartesianValue;
        }

        const cartesianTools = new CartesianTools();
        const newLatLng = cartesianTools.getLatLngFromEarthMap(cartesianValue);
        return new CartesianValue({
            value: cartesianValue.value,
            lat: newLatLng.lat,
            lng: newLatLng.lng,
        });
    }

    protected normalizePoint(
        point: LatLng | {latitude: number; longitude: number} | {lat: number; lng: number}
    ): {lat: number; lng: number} | undefined {
        let lat: number | undefined;
        let lng: number | undefined;

        if (point instanceof LatLng) {
            lat = point.lat;
            lng = point.lng;
        } else if (
            typeof (point as any)?.lat === 'number' &&
            typeof (point as any)?.lng === 'number'
        ) {
            lat = (point as any).lat;
            lng = (point as any).lng;
        } else if (
            typeof (point as any)?.latitude === 'number' &&
            typeof (point as any)?.longitude === 'number'
        ) {
            lat = (point as any).latitude;
            lng = (point as any).longitude;
        }

        if (typeof lat !== 'number' || typeof lng !== 'number') {
            return undefined;
        }

        return {lat, lng};
    }

    protected roundRectangles(
        rects: [LatLng, LatLng][],
        cartesianTools: CartesianTools
    ): [LatLng, LatLng][] {
        return rects.map((r) => {
            const r0 = cartesianTools.getLatLngFromEarthMap(r[0]);
            const r1 = cartesianTools.getLatLngFromEarthMap(r[1]);
            return [r0, r1];
        });
    }

    protected findClosestRainSpeed(lat: number, lng: number): RainSpeed | undefined {
        return this.rainSpeeds.reduce(
            (closest, current) => {
                if (!closest) {
                    return current;
                }

                const currentCenter = current.getCenter();
                const closestCenter = closest.getCenter();

                const currentDistance = CartesianTools.GetDistanceFromLatLngInKm(
                    new LatLng({lat, lng}),
                    currentCenter
                );
                const closestDistance = CartesianTools.GetDistanceFromLatLngInKm(
                    new LatLng({lat, lng}),
                    closestCenter
                );

                return currentDistance < closestDistance ? current : closest;
            },
            undefined as RainSpeed | undefined
        );
    }
}
