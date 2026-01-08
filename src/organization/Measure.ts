import {IPolarMeasureValue} from '../polar';
import {RaainNode} from './RaainNode';
import {ICartesianMeasureValue} from '../cartesian';
import {Tools} from '../utils';

export class Measure extends RaainNode {
    public date: Date;
    //   -> why array ? because you have different angle/axis from the Radar
    public values: IPolarMeasureValue[] | ICartesianMeasureValue[] | number[];
    public validity: number;

    // internal
    private configurationAsJSON: string;

    constructor(json: {
        id: string;
        values: IPolarMeasureValue[] | ICartesianMeasureValue[] | number[];
        date?: Date | string;
        validity?: number;
        configurationAsJSON?: string;
        version?: string;
    }) {
        super(json);
        this.values = json.values ? json.values : [];
        this.date = json.date ? new Date(json.date) : undefined;
        this.validity = json.validity >= 0 ? json.validity : -1;
        this.setConfiguration(json.configurationAsJSON);
    }

    public setConfiguration(configuration: string | any) {
        let conf = configuration;
        try {
            conf = JSON.parse(configuration);
        } catch (ignored) {
            // Ignore parsing errors, use the original value
        }

        if (conf) {
            this.configurationAsJSON = JSON.stringify(conf);
        }
    }

    public toJSON(options: {removeValues?: boolean} = {}) {
        const json = super.toJSON();
        const extendedJson = {
            ...json,
            date: this.date,
            validity: this.validity,
            configurationAsJSON: this.configurationAsJSON,
            values: [] as IPolarMeasureValue[] | ICartesianMeasureValue[] | number[],
        };

        if (options?.removeValues) {
            return extendedJson;
        }

        return {
            ...extendedJson,
            values: this.values,
        };
    }

    public getConfiguration(): any {
        return RaainNode.parseJsonLikeOrNull(this.configurationAsJSON);
    }

    public getMinMaxValues(): {min: number; max: number} | null {
        if (this.values.length === 0) {
            return null;
        }

        // For number[] type
        if (typeof this.values[0] === 'number') {
            return Tools.calculateMinMax(this.values as number[]);
        }

        // Helper function to aggregate min/max values from an array of objects
        const aggregateMinMax = (
            values: Array<{getMinMaxValues: () => {min: number; max: number} | null}>
        ) => {
            let minValue = Number.MAX_VALUE;
            let maxValue = Number.MIN_VALUE;
            let hasValues = false;

            for (const value of values) {
                const minMax = value.getMinMaxValues();
                if (minMax) {
                    minValue = Math.min(minValue, minMax.min);
                    maxValue = Math.max(maxValue, minMax.max);
                    hasValues = true;
                }
            }

            return hasValues ? {min: minValue, max: maxValue} : null;
        };

        // For IPolarMeasureValue[] type
        if ('getPolars' in this.values[0]) {
            return aggregateMinMax(this.values as IPolarMeasureValue[]);
        }

        // For ICartesianMeasureValue[] type
        if ('getCartesianValues' in this.values[0]) {
            return aggregateMinMax(this.values as ICartesianMeasureValue[]);
        }

        return null;
    }
}
