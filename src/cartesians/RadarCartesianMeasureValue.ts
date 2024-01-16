import {CartesianValue} from './CartesianValue';
import {CartesianMeasureValue} from './CartesianMeasureValue';

export class RadarCartesianMeasureValue extends CartesianMeasureValue {

    public angle: number;

    constructor(
        cartesianValuesOrObject: RadarCartesianMeasureValue | CartesianValue[] | string,
        cartesianPixelWidth: { lat: number, lng: number } = {lat: 0, lng: 0},
        angle?: number,
    ) {
        if (typeof cartesianValuesOrObject === 'string') {
            super(cartesianValuesOrObject, cartesianPixelWidth);
            this.angle = angle;
            return;
        }

        if (cartesianValuesOrObject instanceof RadarCartesianMeasureValue) {
            super(cartesianValuesOrObject.getCartesianValues(), cartesianValuesOrObject.getCartesianPixelWidth());
            this.angle = cartesianValuesOrObject.angle;
            return;
        }

        if ('cartesianValues' in cartesianValuesOrObject && 'cartesianPixelWidth' in cartesianValuesOrObject) {
            super(cartesianValuesOrObject['cartesianValues'] as any, cartesianValuesOrObject['cartesianPixelWidth'] as any);
            this.angle = cartesianValuesOrObject['angle'];
            return;
        }

        super(cartesianValuesOrObject, cartesianPixelWidth);
        this.angle = angle;
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
