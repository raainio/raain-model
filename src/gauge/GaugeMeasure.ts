import {Measure} from '../organization/Measure';
import {IPolarMeasureValue} from '../polar/IPolarMeasureValue';
import {ICartesianMeasureValue} from '../cartesian/ICartesianMeasureValue';

/**
 *  api/gauges/:id/measures/:id
 */
export class GaugeMeasure extends Measure {

    public static TYPE = 'gauge-measure';
    public timeInSec: number;

    constructor(json: {
                    id: string,
                    values: IPolarMeasureValue[] | ICartesianMeasureValue[] | Measure[] | number[],
                    date?: Date,
                    validity?: number,
                    timeInSec?: number,
                    configurationAsJSON?: string | any,
                }
    ) {
        super(json);
        this.timeInSec = json.timeInSec >= 0 ? json.timeInSec : -1;
    }

    public toJSON(): JSON {
        const json = super.toJSON();
        json['timeInSec'] = this.timeInSec;
        return json;
    }

    protected getLinkType(): string {
        return GaugeMeasure.TYPE;
    }
}

