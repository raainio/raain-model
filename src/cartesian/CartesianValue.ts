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

    toJSON() {
        const json = super.toJSON();
        json['value'] = this.value;
        return json;
    }
}
