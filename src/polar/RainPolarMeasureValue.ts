import {IPolarMeasureValue} from './IPolarMeasureValue';
import {IVersion} from '../organization/IVersion';
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

    static From(obj: any): RainPolarMeasureValue {
        let version: string,
            polarMeasureValue: PolarMeasureValue;

        if (typeof obj.version === 'string') {
            version = obj.version;
        }

        if (typeof obj.polarMeasureValue !== 'undefined') {
            polarMeasureValue = obj.polarMeasureValue;
        }

        if (typeof obj.measureValuePolarContainers !== 'undefined') {
            polarMeasureValue = new PolarMeasureValue({measureValuePolarContainers: obj.measureValuePolarContainers});
        }

        return new RainPolarMeasureValue({polarMeasureValue, version});
    }

    public toJSON(stringify = false): any {
        const json: any = super.toJSON(stringify);
        json.version = this.version;
        return json;
    }

    public toJSONWithPolarStringified(): any {
        const json: any = super.toJSONWithPolarStringified();
        json.version = this.version;
        return json;
    }

    public getVersion(): string {
        return this.version;
    }
}
