import {Measure} from '../organization';
import {IPolarMeasureValue} from '../polar';
import {ICartesianMeasureValue} from '../cartesian';
import {RadarNode} from './RadarNode';

/**
 *  api/radars/:id/measures/:id
 */
export class RadarMeasure extends Measure {

    public static TYPE = 'radar-measure';

    constructor(json: {
                    id: string,
                    values: IPolarMeasureValue[] | ICartesianMeasureValue[] | number[],
                    date?: Date,
                    validity?: number,
                    configurationAsJSON?: string,
                    radar?: string,
                }
    ) {
        super(json);
        if (json.radar) {
            this.addLinks([new RadarNode({id: json.radar, latitude: NaN, longitude: NaN, team: null, name: null})]);
        }
    }

    public toJSON(options?: { removeValues?: boolean }) {
        const json = super.toJSON(options);
        const radarLink = this.getLink(RadarNode.TYPE);

        if (radarLink) {
            return {
                ...json,
                radar: radarLink.getId()
            };
        }

        return json;
    }

    protected getLinkType(): string {
        return RadarMeasure.TYPE;
    }
}
