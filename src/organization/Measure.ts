import {IPolarMeasureValue} from '../polar';
import {RaainNode} from './RaainNode';
import {ICartesianMeasureValue} from '../cartesian';

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
        date?: Date;
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
        try {
            return JSON.parse(this.configurationAsJSON);
        } catch (e) {
            // Return null if configuration cannot be parsed
        }
        return null;
    }

    public getMinMaxValues(): {min: number; max: number} | null {
        if (this.values.length === 0) {
            return null;
        }

        // For number[] type
        if (typeof this.values[0] === 'number') {
            const numValues = this.values as number[];
            return {
                min: Math.min(...numValues),
                max: Math.max(...numValues),
            };
        }

        // For IPolarMeasureValue[] type
        if ('getPolars' in this.values[0]) {
            const polarValues = this.values as IPolarMeasureValue[];
            let minValue = Number.MAX_VALUE;
            let maxValue = Number.MIN_VALUE;
            let hasValues = false;

            for (const polarValue of polarValues) {
                const minMax = polarValue.getMinMaxValues();
                if (minMax) {
                    minValue = Math.min(minValue, minMax.min);
                    maxValue = Math.max(maxValue, minMax.max);
                    hasValues = true;
                }
            }

            if (!hasValues) {
                return null;
            }

            return {
                min: minValue,
                max: maxValue,
            };
        }

        // For ICartesianMeasureValue[] type
        if ('getCartesianValues' in this.values[0]) {
            const cartesianValues = this.values as ICartesianMeasureValue[];
            let minValue = Number.MAX_VALUE;
            let maxValue = Number.MIN_VALUE;
            let hasValues = false;

            for (const cartesianValue of cartesianValues) {
                const minMax = cartesianValue.getMinMaxValues();
                if (minMax) {
                    minValue = Math.min(minValue, minMax.min);
                    maxValue = Math.max(maxValue, minMax.max);
                    hasValues = true;
                }
            }

            if (!hasValues) {
                return null;
            }

            return {
                min: minValue,
                max: maxValue,
            };
        }

        return null;
    }
}
