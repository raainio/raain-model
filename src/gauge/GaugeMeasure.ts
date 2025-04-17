import {Measure} from '../organization';
import {IPolarMeasureValue} from '../polar';
import {ICartesianMeasureValue} from '../cartesian';
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

    public toJSON(options?: { removeValues?: boolean }) {
        const json = super.toJSON(options);
        const gaugeLink = this.getLink(GaugeNode.TYPE);
        if (gaugeLink) {
            json['gauge'] = gaugeLink.getId();
        }
        return json;
    }

    protected getLinkType(): string {
        return GaugeMeasure.TYPE;
    }
}
