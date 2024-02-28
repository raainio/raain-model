import {CartesianValue} from './CartesianValue';
import {CartesianMeasureValue} from './CartesianMeasureValue';

export class RadarCartesianMeasureValue extends CartesianMeasureValue {

    public angle: number;

    constructor(json: {
        cartesianValues: string | CartesianValue[],
        cartesianPixelWidth: { lat: number, lng: number },
        angle: number,
    }) {

        super(json);
        this.angle = json.angle;
    }

    toJSON(stringify = false): JSON {
        const json: any = super.toJSON(stringify);
        json.angle = this.angle;
        return json;
    }

    toJSONWithCartesianValuesStringified(): JSON {
        const json: any = super.toJSONWithCartesianValuesStringified();
        json.angle = this.angle;
        return json;
    }
}
