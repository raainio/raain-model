import {CartesianTools, CartesianValue, LatLng} from '../cartesian';

/**
 *  api/rains/:rainId/computations/:rainHistoryId/speeds => RainSpeedMap.map => RainSpeed[]
 */
export class RainSpeed {
    public azimuthInDegrees: number;
    public speedInMetersPerSec: number;
    public trustRatio: number;
    public date?: Date;
    public latLngs: [LatLng, LatLng][];

    constructor(json: {
        azimuthInDegrees: number;
        speedInMetersPerSec: number;
        trustRatio?: number;
        date?: Date;
        latLngs?: [LatLng, LatLng][] | LatLng;
    }) {
        this.azimuthInDegrees = json.azimuthInDegrees;
        this.speedInMetersPerSec = json.speedInMetersPerSec;
        this.trustRatio = json.trustRatio ?? -1;
        if (json.date) {
            this.date = json.date;
        }
        this.setArea(json.latLngs);
    }

    public getCenter() {
        return CartesianTools.GetLatLngRectsCenter(this.latLngs);
    }

    public toJSON() {
        return {
            azimuthInDegrees: this.azimuthInDegrees,
            speedInMetersPerSec: this.speedInMetersPerSec,
            trustRatio: this.trustRatio,
            date: this.date,
            latLngs: this.latLngs,
        };
    }

    /**
     * Transpose a CartesianValue based on this RainSpeed's speed and azimuth over a time period
     */
    public transpose(
        cartesianValue: CartesianValue,
        diffInMinutes: number,
        options?: {inEarthMap?: boolean}
    ): CartesianValue {
        const value = cartesianValue.value;
        let lat = cartesianValue.lat;
        let lng = cartesianValue.lng;

        const cartesianTools = new CartesianTools();
        const speed = this.speedInMetersPerSec ?? 0;
        let azimuthDeg = this.azimuthInDegrees ?? 0;
        const timeSec = (typeof diffInMinutes === 'number' ? diffInMinutes : 0) * 60;
        let distance = speed * timeSec; // meters

        // Handle negative time by reversing the bearing
        if (distance < 0) {
            distance = Math.abs(distance);
            azimuthDeg = (azimuthDeg + 180) % 360;
        }

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
            lng = CartesianTools.NormalizeLongitude((lon2 * 180) / Math.PI);
            lat = CartesianTools.ClampLatitude((lat2 * 180) / Math.PI);
        }

        const transposedCartesianValue = new CartesianValue({
            value,
            lat,
            lng,
        });

        if (!options?.inEarthMap) {
            return transposedCartesianValue;
        }

        const newLatLng = cartesianTools.getLatLngFromEarthMap(transposedCartesianValue);
        return new CartesianValue({
            value: cartesianValue.value,
            lat: newLatLng.lat,
            lng: newLatLng.lng,
        });
    }

    private setArea(latLngs: [LatLng, LatLng][] | LatLng) {
        let latLngsToSet = latLngs ?? [];
        if (latLngs instanceof LatLng) {
            latLngsToSet = [[latLngs, latLngs]];
        }
        this.latLngs = latLngsToSet as [LatLng, LatLng][];
    }
}
