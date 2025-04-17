import {IPolarMeasureValue} from './IPolarMeasureValue';
import {IVersion} from '../organization';
import {AbstractPolarMeasureValue} from './AbstractPolarMeasureValue';
import {PolarMeasureValue} from './PolarMeasureValue';

/**
 * Computed Rain with polar value containers
 */
export class RainPolarMeasureValue extends AbstractPolarMeasureValue implements IPolarMeasureValue, IVersion {

    private readonly version: string;

    constructor(json: {
        polarMeasureValue: RainPolarMeasureValue | PolarMeasureValue | string,
        version?: string
    }) {
        super(json);

        if (json.polarMeasureValue instanceof RainPolarMeasureValue) {
            this.version = json.polarMeasureValue.version;
            return;
        }

        this.version = json.version;
    }

    static From(obj: IPolarMeasureValue | any): RainPolarMeasureValue {
        let version: string,
            polarMeasureValue: PolarMeasureValue;

        if (typeof obj.version === 'string') {
            version = obj.version;
        }

        if (typeof obj.polarMeasureValue !== 'undefined') {
            polarMeasureValue = obj.polarMeasureValue;
        }

        return new RainPolarMeasureValue({polarMeasureValue, version});
    }

    public toJSON() {
        const json = super.toJSON();
        return {
            ...json,
            version: this.version
        };
    }

    public toJSONWithPolarStringified() {
        const json = super.toJSONWithPolarStringified();
        return {
            ...json,
            version: this.version
        };
    }

    public getVersion(): string {
        return this.version;
    }
}
