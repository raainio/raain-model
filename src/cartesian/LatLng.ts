import {CartesianTools} from './CartesianTools';

export class LatLng {
    public lat: number;
    public lng: number;

    constructor(json: {lat: number; lng: number} | {latitude: number; longitude: number}) {
        const hasLatLng =
            typeof (json as any)?.lat !== 'undefined' && typeof (json as any)?.lng !== 'undefined';
        const hasLatitudeLongitude =
            typeof (json as any)?.latitude !== 'undefined' &&
            typeof (json as any)?.longitude !== 'undefined';

        if (!hasLatLng && !hasLatitudeLongitude) {
            throw new Error('LatLng needs valid latitude && longitude');
        }

        const lat = hasLatLng ? (json as any).lat : (json as any).latitude;
        const lng = hasLatLng ? (json as any).lng : (json as any).longitude;

        if (
            typeof lat !== 'number' ||
            typeof lng !== 'number' ||
            Number.isNaN(lat) ||
            Number.isNaN(lng)
        ) {
            throw new Error('LatLng needs numeric latitude && longitude');
        }

        this.lat = lat;
        this.lng = lng;
    }

    public equals(v: LatLng) {
        return this.lat === v.lat && this.lng === v.lng;
    }

    setPrecision(precision: number = 12) {
        const tenPower = Math.pow(10, precision);
        this.lat = Math.round(this.lat * tenPower) / tenPower;
        this.lng = Math.round(this.lng * tenPower) / tenPower;
    }

    rounded(scale: LatLng) {
        this.lat = CartesianTools.RoundLatLng(this.lat, scale.lat, true);
        this.lng = CartesianTools.RoundLatLng(this.lng, scale.lng, true);
    }

    limitPrecision(precision = 12) {
        this.lat = CartesianTools.LimitWithPrecision(this.lat, precision);
        this.lng = CartesianTools.LimitWithPrecision(this.lng, precision);
    }

    toJSON() {
        return {lat: this.lat, lng: this.lng};
    }
}
