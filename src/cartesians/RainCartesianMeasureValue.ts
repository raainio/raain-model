import {IVersion} from '../organizations/IVersion';
import {CartesianValue} from './CartesianValue';
import {CartesianMeasureValue} from './CartesianMeasureValue';

export class RainCartesianMeasureValue extends CartesianMeasureValue implements IVersion {

    private readonly version: string;

    constructor(
        cartesianValuesOrObject: any | CartesianValue[],
        version?: string,
    ) {
        if (!cartesianValuesOrObject) {
            throw new Error('RainCartesianMeasureValue needs a valid Object or ID');
        }

        if (typeof (cartesianValuesOrObject.cartesianValues) !== 'undefined') {
            super(cartesianValuesOrObject.cartesianValues);
            this.version = cartesianValuesOrObject.version;
            return;
        }

        super(cartesianValuesOrObject);
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
