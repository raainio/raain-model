import {LatLng} from './LatLng';

export class CartesianValue extends LatLng {

    public value: number;

    constructor(json: {
                    value: number,
                    lat: number,
                    lng: number
                }
    ) {
        super(json);
        this.value = json.value;
    }

    toJSON(): {
        value: number,
        lat: number,
        lng: number
    } {
        const json = super.toJSON() as any;
        json.value = this.value;
        return json;
    }
}
