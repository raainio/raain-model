import {LatLng} from './LatLng';

/**
 * In a map pixel context (lat, lng) = South - West corner (see CartesianPixelPosition.SW) of the pixel
 */
export class CartesianValue extends LatLng {
    public value: number;

    constructor(json: {value: number; lat: number; lng: number}) {
        super(json);
        this.value = json.value;
    }

    toJSON(): {
        value: number;
        lat: number;
        lng: number;
    } {
        const json = super.toJSON() as any;
        json.value = this.value;
        return json;
    }
}
