import {CartesianValue} from './CartesianValue';
import {CartesianMeasureValue} from './CartesianMeasureValue';

export class RadarCartesianMeasureValue extends CartesianMeasureValue {

    public angle: number;

    constructor(
        angleOrObject: any | number,
        cartesianValues?: string | CartesianValue[]
    ) {
        if (!angleOrObject) {
            throw new Error('RadarCartesianMeasureValue needs a valid Object or ID');
        }

        if (typeof (angleOrObject.angle) !== 'undefined') {
            super(angleOrObject.cartesianValues);
            this.angle = angleOrObject.angle;
            return;
        }

        super(cartesianValues);
        this.angle = angleOrObject;
    }

    toJSON(): JSON {
        let json: any = super.toJSON();
        json.angle = this.angle;
        return json;
    }

    toJSONWithCartesianValuesStringified(): JSON {
        const json: any = super.toJSONWithCartesianValuesStringified();
        json.angle = this.angle;
        return json;
    }
}