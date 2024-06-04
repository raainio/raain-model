import {IVersion} from '../organization/IVersion';
import {CartesianValue} from './CartesianValue';
import {CartesianMeasureValue} from './CartesianMeasureValue';

export class RainCartesianMeasureValue extends CartesianMeasureValue implements IVersion {

    private readonly version: string;

    constructor(json: {
        cartesianValues: string | CartesianValue[],
        cartesianPixelWidth: { lat: number, lng: number },
        version?: string,
    }) {
        super(json);
        this.version = json.version;
    }

    getVersion(): string {
        return this.version;
    }

    toJSON(stringify = false): any {
        const json: any = super.toJSON(stringify);
        json.version = this.getVersion();
        return json;
    }

    toJSONWithCartesianValuesStringified(): any {
        const json: any = super.toJSONWithCartesianValuesStringified();
        json.version = this.getVersion();
        return json;
    }
}
