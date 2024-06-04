import {Measure} from '../organization/Measure';
import {IPolarMeasureValue} from '../polar/IPolarMeasureValue';
import {ICartesianMeasureValue} from '../cartesian/ICartesianMeasureValue';
import {GaugeNode} from './GaugeNode';

/**
 *  api/gauges/:id/measures/:id
 */
export class GaugeMeasure extends Measure {

    public static TYPE = 'gauge-measure';
    public timeInSec: number;
    public gauge: string;

    constructor(json: {
                    id: string,
                    values: IPolarMeasureValue[] | ICartesianMeasureValue[] | Measure[] | number[],
                    date?: Date,
                    validity?: number,
                    timeInSec?: number,
                    configurationAsJSON?: string,
                    gauge?: string
                }
    ) {
        super(json);
        this.timeInSec = json.timeInSec >= 0 ? json.timeInSec : -1;
        if (json.gauge) {
            this.addLinks([new GaugeNode({id: json.gauge, latitude: NaN, longitude: NaN, team: null, name: null})]);
        }
    }

    public toJSON(): any {
        const json = super.toJSON();
        json['timeInSec'] = this.timeInSec;
        const gaugeId = this.getLinkId(GaugeNode.TYPE);
        if (gaugeId) {
            json['gauge'] = gaugeId;
        }
        return json;
    }

    protected getLinkType(): string {
        return GaugeMeasure.TYPE;
    }
}
