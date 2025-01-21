import {IVersion} from '../organization/IVersion';
import {CartesianValue} from './CartesianValue';
import {CartesianMeasureValue} from './CartesianMeasureValue';
import {LatLng} from './LatLng';

export class RainCartesianMeasureValue extends CartesianMeasureValue implements IVersion {

    private readonly version: string;

    constructor(json: {
        cartesianValues: string | CartesianValue[],
        limitPoints: [LatLng, LatLng],
        version: string,
    }) {
        super(json);
        this.version = json.version;
    }

    getVersion(): string {
        return this.version;
    }

    toJSON(options = {stringify: false}): any {
        const json: any = super.toJSON(options);
        json.version = this.getVersion();
        return json;
    }

    toJSONWithCartesianValuesStringified(): any {
        return this.toJSON({stringify: true});
    }
}
