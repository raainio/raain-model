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

    getRainSpeed(
        point: LatLng | {latitude: number; longitude: number} | {lat: number; lng: number},
        options?: {inEarthMap?: boolean; strictContaining?: boolean}
    ): RainSpeed | undefined {
        // normalize input to numbers
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
            let roundedRects = rects;
            if (options?.inEarthMap) {
                roundedRects = roundedRects.map((r) => {
                    const r0 = cartesianTools.getLatLngFromEarthMap(r[0]);
                    const r1 = cartesianTools.getLatLngFromEarthMap(r[1]);
                    return [r0, r1];
                });
            }

            if (CartesianTools.IsPointInAnyRect(lat, lng, roundedRects)) {
                return rs;
            }
        }

        // If no containing area found and strictContaining is not true, find closest by center distance
        if (options?.strictContaining !== true) {
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

        return undefined;
    }

    transpose(
        cartesianValue: CartesianValue,
        diffInMinutes: number,
        options?: {inEarthMap?: boolean; strictContaining?: boolean}
    ) {
        const lat = cartesianValue.lat;
        const lng = cartesianValue.lng;
        const cartesianTools = new CartesianTools();
        let rainSpeed: RainSpeed;

        if (options?.strictContaining) {
            // find matching RainSpeed areas that contain the point
            const matches = this.rainSpeeds.filter((rs) =>
                CartesianTools.IsPointInAnyRect(lat, lng, rs?.latLngs ?? [])
            );
            if (matches.length >= 1) {
                rainSpeed = matches[0];
            }
        } else {
            // Find the closest RainSpeed by calculating distance from point to each RainSpeed's center
            rainSpeed = this.rainSpeeds.reduce(
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

        if (rainSpeed) {
            return rainSpeed.transpose(cartesianValue, diffInMinutes, options);
        }

        if (!options?.inEarthMap) {
            return cartesianValue;
        }

        const newLatLng = cartesianTools.getLatLngFromEarthMap(cartesianValue);
        return new CartesianValue({
            value: cartesianValue.value,
            lat: newLatLng.lat,
            lng: newLatLng.lng,
        });
    }
}
