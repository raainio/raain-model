import {IPolarMeasureValue} from './IPolarMeasureValue';
import {AbstractPolarMeasureValue} from './AbstractPolarMeasureValue';
import {PolarMeasureValue} from './PolarMeasureValue';

/**
 * Radar with polar value containers
 */
export class RadarPolarMeasureValue extends AbstractPolarMeasureValue implements IPolarMeasureValue {

    public angle: number;

    constructor(
        polars: RadarPolarMeasureValue | PolarMeasureValue | string,
        angle?: number
    ) {
        super(polars);

        if (polars instanceof RadarPolarMeasureValue) {
            this.angle = polars.angle;
            return;
        }
        if (typeof polars === 'string') {
            const object = JSON.parse(polars);
            this.angle = angle ? angle : object.angle;
            return;
        }
        this.angle = angle;
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
