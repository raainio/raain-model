import {Link, Measure} from '../organization';
import {IPolarMeasureValue} from '../polar';
import {ICartesianMeasureValue} from '../cartesian';
import {GaugeNode} from './GaugeNode';

/**
 *  api/gauges/:id/measures?begin=...&end=...
 */
export class GaugeMeasure extends Measure {
    public static TYPE = 'gauge-measure';

    public gauge: string;

    constructor(json: {
        id: string;
        values: IPolarMeasureValue[] | ICartesianMeasureValue[] | number[];
        date?: Date;
        validity?: number;
        configurationAsJSON?: string;
        gauge?: string;
    }) {
        super(json);
        if (json.gauge) {
            this.addLinks(this.getGaugeLinks([json.gauge]));
        }
    }

    public toJSON(options?: {removeValues?: boolean}) {
        const json = super.toJSON(options);
        const gaugeLink = this.getLink(GaugeNode.TYPE);
        if (gaugeLink) {
            json['gauge'] = gaugeLink.getId();
        }
        return json;
    }

    protected getGaugeLinks(linksToPurify: any[]): any[] {
        if (!linksToPurify || linksToPurify.length === 0) {
            return [];
        }

        return linksToPurify.map((l) => {
            if (l instanceof Link) {
                return l;
            } else if (l && l['_id']) {
                return new GaugeNode({
                    id: l['_id'].toString(),
                    latitude: 0,
                    longitude: 0,
                    name: l.name,
                    team: l.team,
                });
            } else if (l && l.id) {
                return new GaugeNode({
                    id: l.id.toString(), // 'hex'
                    latitude: 0,
                    longitude: 0,
                    name: l.name,
                    team: l.team,
                });
            }
        });
    }

    protected getLinkType(): string {
        return GaugeMeasure.TYPE;
    }
}
