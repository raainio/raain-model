import {Link, Measure} from '../organization';
import {IPolarMeasureValue} from '../polar';
import {ICartesianMeasureValue} from '../cartesian';
import {RadarNode} from './RadarNode';
import {RaainNodeType} from '../organization/RaainNodeType';

/**
 * @external
 *  - API: /radars/:id/measures
 *  - API: /radars/:id/measures/:measureId
 */
export class RadarMeasure extends Measure {
    public static TYPE = RaainNodeType.RadarMeasure;

    constructor(json: {
        id: string;
        values: IPolarMeasureValue[] | ICartesianMeasureValue[] | number[];
        date?: Date;
        validity?: number;
        configurationAsJSON?: string;
        radar?: string;
    }) {
        super(json);
        if (json.radar) {
            this.addLinks(this.getRadarLinks([json.radar]));
        }
    }

    public toJSON(options?: {removeValues?: boolean}) {
        const json = super.toJSON(options);
        const radarLink = this.getLink(RadarNode.TYPE);

        if (radarLink) {
            return {
                ...json,
                radar: radarLink.getId(),
            };
        }

        return json;
    }

    protected getRadarLinks(linksToPurify: any[]): any[] {
        if (!linksToPurify || linksToPurify.length === 0) {
            return [];
        }

        return linksToPurify.map((l) => {
            if (l instanceof Link) {
                return l;
            } else if (l && l['_id']) {
                return new RadarNode({
                    id: l['_id'].toString(),
                    latitude: 0,
                    longitude: 0,
                    name: l.name,
                    team: l.team,
                });
            } else if (l && l.id) {
                return new RadarNode({
                    id: l.id.toString(), // 'hex'
                    latitude: 0,
                    longitude: 0,
                    name: l.name,
                    team: l.team,
                });
            }
        });
    }

    protected getLinkType(): RaainNodeType {
        return RadarMeasure.TYPE;
    }
}
