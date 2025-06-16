import {IVersion} from '../organization';
import {CartesianValue} from './CartesianValue';
import {CartesianMeasureValue} from './CartesianMeasureValue';
import {LatLng} from './LatLng';

export class RainCartesianMeasureValue extends CartesianMeasureValue implements IVersion {
    private readonly version: string;

    constructor(json: {
        cartesianValues: string | CartesianValue[];
        limitPoints: [LatLng, LatLng];
        version: string;
    }) {
        super(json);
        this.version = json.version;
    }

    getVersion(): string {
        return this.version;
    }

    toJSON(options = {stringify: false}) {
        const json = super.toJSON(options);
        return {
            ...json,
            version: this.getVersion(),
        };
    }

    toJSONWithCartesianValuesStringified() {
        return this.toJSON({stringify: true});
    }
}
