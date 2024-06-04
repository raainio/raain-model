import {IPolarMeasureValue} from './IPolarMeasureValue';
import {AbstractPolarMeasureValue} from './AbstractPolarMeasureValue';
import {PolarMeasureValue} from './PolarMeasureValue';

/**
 * Radar with polar value containers
 */
export class RadarPolarMeasureValue extends AbstractPolarMeasureValue implements IPolarMeasureValue {

    public angle: number;

    constructor(json: {
        polarMeasureValue: RadarPolarMeasureValue | PolarMeasureValue | string,
        angle?: number
    }) {
        super(json);

        if (json.polarMeasureValue instanceof RadarPolarMeasureValue) {
            this.angle = json.polarMeasureValue.angle;
            return;
        }

        if (typeof json.polarMeasureValue === 'string') {
            const object = JSON.parse(json.polarMeasureValue);
            this.angle = json.angle ? json.angle : object.angle;
            return;
        }

        this.angle = json.angle;
    }

    public toJSON(stringify = false): any {
        const json: any = super.toJSON(stringify);
        json.angle = this.angle;
        return json;
    }

    public toJSONWithPolarStringified(): any {
        const json: any = super.toJSONWithPolarStringified();
        json.angle = this.angle;
        return json;
    }
}
