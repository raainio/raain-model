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
            for (const rect of rects) {
                const [p1, p2] = rect || ([] as unknown as [LatLng, LatLng]);
                if (!p1 || !p2) {
                    continue;
                }
                const minLat = Math.min(p1.lat, p2.lat);
                const maxLat = Math.max(p1.lat, p2.lat);
                const minLng = Math.min(p1.lng, p2.lng);
                const maxLng = Math.max(p1.lng, p2.lng);
                if (lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng) {
                    return rs;
                }
            }
        }
        return undefined;
    }

    transpose(cartesianValue: CartesianValue, diffInMinutes: number) {
        const value = cartesianValue.value;

        const lat = cartesianValue.lat;
        const lng = cartesianValue.lng;

        // find matching RainSpeed areas that contain the point
        const matches = this.rainSpeeds.filter((rs) =>
            (rs?.latLngs ?? []).some(([p1, p2]) => {
                if (!p1 || !p2) {
                    return false;
                }
                const minLat = Math.min(p1.lat, p2.lat);
                const maxLat = Math.max(p1.lat, p2.lat);
                const minLng = Math.min(p1.lng, p2.lng);
                const maxLng = Math.max(p1.lng, p2.lng);
                return lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng;
            })
        );

        if (matches.length === 1) {
            const rs = matches[0];
            const speed = rs.speedInMetersPerSec ?? 0;
            const azimuthDeg = rs.azimuthInDegrees ?? 0;
            const timeSec = (typeof diffInMinutes === 'number' ? diffInMinutes : 0) * 60;
            const distance = speed * timeSec; // meters

            if (distance > 0) {
                const R = 6371000; // Earth radius in meters
                const bearing = (azimuthDeg * Math.PI) / 180; // to radians
                const lat1 = (lat * Math.PI) / 180;
                const lon1 = (lng * Math.PI) / 180;
                const angDist = distance / R; // angular distance in radians

                const sinLat1 = Math.sin(lat1);
                const cosLat1 = Math.cos(lat1);
                const sinAng = Math.sin(angDist);
                const cosAng = Math.cos(angDist);

                const sinLat2 = sinLat1 * cosAng + cosLat1 * sinAng * Math.cos(bearing);
                const lat2 = Math.asin(Math.min(1, Math.max(-1, sinLat2)));
                const y = Math.sin(bearing) * sinAng * cosLat1;
                const x = cosAng - sinLat1 * Math.sin(lat2);
                const lon2 = lon1 + Math.atan2(y, x);

                // normalize using CartesianTools
                const cartesianTools = new CartesianTools();
                const newLng = CartesianTools.NormalizeLongitude((lon2 * 180) / Math.PI);
                const newLat = CartesianTools.ClampLatitude((lat2 * 180) / Math.PI);
                const newLatLng = cartesianTools.getLatLngFromEarthMap(
                    new LatLng({lat: newLat, lng: newLng})
                );

                return new CartesianValue({
                    value,
                    lat: newLatLng.lat,
                    lng: newLatLng.lng,
                });
            }
        }

        // default: return unchanged
        return new CartesianValue({
            value,
            lat,
            lng,
        });
    }
}
