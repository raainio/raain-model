import {Measure} from '../organization/Measure';
import {IPolarMeasureValue} from '../polar/IPolarMeasureValue';
import {ICartesianMeasureValue} from '../cartesian/ICartesianMeasureValue';
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

    public toJSON(options?: any): any {
        const json = super.toJSON(options);
        const radarId = this.getLinkId(RadarNode.TYPE);
        if (radarId) {
            json['radar'] = radarId;
        }

        return json;
    }

    protected getLinkType(): string {
        return RadarMeasure.TYPE;
    }
}
