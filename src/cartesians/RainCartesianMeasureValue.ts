import {IVersion} from '../organizations/IVersion';
import {CartesianValue} from './CartesianValue';
import {CartesianMeasureValue} from './CartesianMeasureValue';

export class RainCartesianMeasureValue extends CartesianMeasureValue implements IVersion {

    private readonly version: string;

    constructor(
        cartesianValuesOrObject: any | CartesianValue[],
        cartesianPixelWidth: { lat: number, lng: number } = {lat: 0, lng: 0},
        version?: string,
    ) {
        if (!cartesianValuesOrObject) {
            throw new Error('RainCartesianMeasureValue needs a valid Object or ID');
        }

        if (typeof (cartesianValuesOrObject.cartesianValues) !== 'undefined') {
            super(cartesianValuesOrObject.cartesianValues, cartesianValuesOrObject.cartesianPixelWidth);
            this.version = cartesianValuesOrObject.version;
            return;
        }

        super(cartesianValuesOrObject, cartesianPixelWidth);
        this.version = version;
    }

    getVersion(): string {
        return this.version;
    }

    toJSON(): JSON {
        const json: any = super.toJSON();
        json.version = this.getVersion();
        return json;
    }

    toJSONWithCartesianValuesStringified(): JSON {
        const json: any = super.toJSONWithCartesianValuesStringified();
        json.version = this.getVersion();
        return json;
    }
}
