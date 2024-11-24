import {CartesianValue} from './CartesianValue';
import {CartesianMeasureValue} from './CartesianMeasureValue';

export class RadarCartesianMeasureValue extends CartesianMeasureValue {

    public angle: number;   // In degrees. Radar incidence angle, from 0° to 90°, from the ground to the top
    public axis: number;    // In degrees. Polarization angle 0° = horizontal, 90°= vertical.

    constructor(json: {
        cartesianValues: string | CartesianValue[],
        cartesianPixelWidth: { lat: number, lng: number },
        angle: number,
        axis: number,
    }) {

        super(json);
        this.angle = json.angle;
        this.axis = json.axis;
    }

    toJSON(stringify = false): any {
        const json: any = super.toJSON(stringify);
        json.angle = this.angle;
        json.axis = this.axis;
        return json;
    }

    toJSONWithCartesianValuesStringified(): any {
        const json: any = super.toJSONWithCartesianValuesStringified();
        json.angle = this.angle;
        json.axis = this.axis;
        return json;
    }
}
