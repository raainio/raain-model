import {Measure} from '../organization/Measure';
import {IPolarMeasureValue} from '../polar/IPolarMeasureValue';
import {ICartesianMeasureValue} from '../cartesian/ICartesianMeasureValue';
import {GaugeNode} from './GaugeNode';

/**
 *  api/gauges/:id/measures/:id
 */
export class GaugeMeasure extends Measure {

    public static TYPE = 'gauge-measure';

    public gauge: string;

    constructor(json: {
                    id: string,
                    values: IPolarMeasureValue[] | ICartesianMeasureValue[] | number[],
                    date?: Date,
                    validity?: number,
                    configurationAsJSON?: string,
                    gauge?: string
                }
    ) {
        super(json);
        if (json.gauge) {
            this.addLinks([new GaugeNode({id: json.gauge, latitude: NaN, longitude: NaN, team: null, name: null})]);
        }
    }

    public toJSON(options?: any): any {
        const json = super.toJSON(options);
        json.gauge = this.getLinkId(GaugeNode.TYPE);
        return json;
    }

    protected getLinkType(): string {
        return GaugeMeasure.TYPE;
    }
}
