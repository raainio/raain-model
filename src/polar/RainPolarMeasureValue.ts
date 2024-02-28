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
        polars: RainPolarMeasureValue | PolarMeasureValue | string,
        version?: string
    }) {
        super(json);

        if (json.polars instanceof RainPolarMeasureValue) {
            this.version = json.polars.version;
            return;
        }

        this.version = json.version;
    }

    static From(obj: any): RainPolarMeasureValue {
        let version: string,
            polars: PolarMeasureValue;

        if (typeof obj.version === 'string') {
            version = obj.version;
        }

        if (typeof obj.polars !== 'undefined') {
            polars = obj.polars;
        }

        return new RainPolarMeasureValue({polars, version});
    }

    public toJSON(stringify = false): JSON {
        const json: any = super.toJSON(stringify);
        json.version = this.version;
        return json;
    }

    public toJSONWithPolarStringified(): JSON {
        const json: any = super.toJSONWithPolarStringified();
        json.version = this.version;
        return json;
    }

    public getVersion(): string {
        return this.version;
    }
}
