import {IPolarMeasureValue} from './IPolarMeasureValue';
import {AbstractPolarMeasureValue} from './AbstractPolarMeasureValue';
import {PolarMeasureValue} from './PolarMeasureValue';

/**
 * Radar with polar value containers
 */
export class RadarPolarMeasureValue extends AbstractPolarMeasureValue implements IPolarMeasureValue {

    public angle: number;

    constructor(json: {
        polars: RadarPolarMeasureValue | PolarMeasureValue | string,
        angle?: number
    }) {
        super(json);

        if (json.polars instanceof RadarPolarMeasureValue) {
            this.angle = json.polars.angle;
            return;
        }

        if (typeof json.polars === 'string') {
            const object = JSON.parse(json.polars);
            this.angle = json.angle ? json.angle : object.angle;
            return;
        }
        this.angle = json.angle;
    }

    public toJSON(stringify = false): JSON {
        const json: any = super.toJSON(stringify);
        json.angle = this.angle;
        return json;
    }

    public toJSONWithPolarStringified(): JSON {
        const json: any = super.toJSONWithPolarStringified();
        json.angle = this.angle;
        return json;
    }
}
