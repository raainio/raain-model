import {CartesianValue} from './CartesianValue';
import {CartesianMeasureValue} from './CartesianMeasureValue';
import {LatLng} from './LatLng';

export class RadarCartesianMeasureValue extends CartesianMeasureValue {

    public angle: number;   // In degrees. Radar incidence angle, from 0° to 90°, from the ground to the top
    public axis: number;    // In degrees. Polarization angle 0° = horizontal, 90°= vertical.

    constructor(json: {
        cartesianValues: string | CartesianValue[],
        angle: number,
        axis: number,
        limitPoints: [LatLng, LatLng],
    }) {

        super(json);
        this.angle = json.angle;
        this.axis = json.axis;
    }

    toJSON(options = {stringify: false}): any {
        const json: any = super.toJSON(options);
        json.angle = this.angle;
        json.axis = this.axis;
        return json;
    }

    toJSONWithCartesianValuesStringified(): any {
        return this.toJSON({stringify: true});
    }
}
