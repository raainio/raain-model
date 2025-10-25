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
        point: LatLng | {latitude: number; longitude: number} | {lat: number; lng: number}
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

        // retrieve the first RainSpeed whose area contains the point
        for (const rs of this.rainSpeeds ?? []) {
            const rects = rs?.latLngs ?? [];
            if (CartesianTools.IsPointInAnyRect(lat, lng, rects)) {
                return rs;
            }
        }
        return undefined;
    }

    transpose(
        cartesianValue: CartesianValue,
        diffInMinutes: number,
        options?: {inEarthMap: boolean}
    ) {
        const lat = cartesianValue.lat;
        const lng = cartesianValue.lng;
        const cartesianTools = new CartesianTools();

        // find matching RainSpeed areas that contain the point
        const matches = this.rainSpeeds.filter((rs) =>
            CartesianTools.IsPointInAnyRect(lat, lng, rs?.latLngs ?? [])
        );

        if (matches.length >= 1) {
            const rs = matches[0];
            return rs.transpose(cartesianValue, diffInMinutes, options);
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
