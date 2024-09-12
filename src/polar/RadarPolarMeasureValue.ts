import {IPolarMeasureValue} from './IPolarMeasureValue';
import {AbstractPolarMeasureValue} from './AbstractPolarMeasureValue';
import {PolarMeasureValue} from './PolarMeasureValue';

/**
 * Radar with polar value containers
 */
export class RadarPolarMeasureValue extends AbstractPolarMeasureValue implements IPolarMeasureValue {

    public angle: number;   // In degrees. Radar incidence angle, from 0° to 90°, from the ground to the top
    public axis: number;    // In degrees. Polarization angle 0° = horizontal, 90°= vertical.

    constructor(json: {
        polarMeasureValue: RadarPolarMeasureValue | PolarMeasureValue | string,
        angle: number
        axis: number
    }) {
        super(json);

        if (json.polarMeasureValue instanceof RadarPolarMeasureValue) {
            this.angle = json.polarMeasureValue.angle;
            this.axis = json.polarMeasureValue.axis;
            return;
        }

        if (typeof json.polarMeasureValue === 'string') {
            const object = JSON.parse(json.polarMeasureValue);
            this.angle = typeof json.angle !== 'undefined' ? json.angle : object.angle;
            this.axis = typeof json.axis !== 'undefined' ? json.axis : object.axis;
            return;
        }

        this.angle = json.angle;
        this.axis = json.axis;
    }

    public toJSON(stringify = false): any {
        const json = super.toJSON(stringify);
        json.angle = this.angle;
        json.axis = this.axis;
        return json;
    }

    public toJSONWithPolarStringified(): any {
        const json = super.toJSONWithPolarStringified();
        json.angle = this.angle;
        json.axis = this.axis;
        return json;
    }
}
