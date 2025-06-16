import {CartesianTools} from './CartesianTools';

export class LatLng {
    public lat: number;
    public lng: number;

    constructor(json: {lat: number; lng: number}) {
        if (typeof json?.lat === 'undefined' || typeof json?.lng === 'undefined') {
            throw new Error('LatLng needs valid latitude && longitude');
        }

        this.lat = json.lat;
        this.lng = json.lng;
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
