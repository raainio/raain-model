import {IPolarMeasureValue} from './IPolarMeasureValue';
import {IVersion} from '../organizations/IVersion';
import {AbstractPolarMeasureValue} from './AbstractPolarMeasureValue';
import {PolarMeasureValue} from './PolarMeasureValue';

/**
 * Computed Rain with polar value containers
 */
export class RainPolarMeasureValue extends AbstractPolarMeasureValue implements IPolarMeasureValue, IVersion {

    private readonly version: string;

    constructor(
        polars: RainPolarMeasureValue | PolarMeasureValue | string,
        version?: string
    ) {
        super(polars);

        if (polars instanceof RainPolarMeasureValue) {
            this.version = polars.version;
            return;
        }

        this.version = version;
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
