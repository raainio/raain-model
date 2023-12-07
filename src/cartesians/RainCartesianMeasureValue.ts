import {IVersion} from '../organizations/IVersion';
import {CartesianValue} from './CartesianValue';
import {CartesianMeasureValue} from './CartesianMeasureValue';

export class RainCartesianMeasureValue extends CartesianMeasureValue implements IVersion {

    private readonly version: string;

    constructor(
        cartesianValuesOrObject: RainCartesianMeasureValue | CartesianValue[] | string,
        cartesianPixelWidth: { lat: number, lng: number } = {lat: 0, lng: 0},
        version?: string,
    ) {
        if (typeof cartesianValuesOrObject === 'string') {
            super(cartesianValuesOrObject, cartesianPixelWidth);
            this.version = version;
            return;
        }

        if (cartesianValuesOrObject instanceof RainCartesianMeasureValue) {
            super(cartesianValuesOrObject.getCartesianValues(), cartesianValuesOrObject.getCartesianPixelWidth());
            this.version = cartesianValuesOrObject.getVersion();
            return;
        }

        if ('cartesianValues' in cartesianValuesOrObject && 'cartesianPixelWidth' in cartesianValuesOrObject) {
            super(cartesianValuesOrObject['cartesianValues'] as any, cartesianValuesOrObject['cartesianPixelWidth'] as any);
            this.version = cartesianValuesOrObject['version'];
            return;
        }

        super(cartesianValuesOrObject, cartesianPixelWidth);
        this.version = version;
    }

    getVersion(): string {
        return this.version;
    }

    toJSON(stringify = false): JSON {
        const json: any = super.toJSON(stringify);
        json.version = this.getVersion();
        return json;
    }

    toJSONWithCartesianValuesStringified(): JSON {
        const json: any = super.toJSONWithCartesianValuesStringified();
        json.version = this.getVersion();
        return json;
    }
}
