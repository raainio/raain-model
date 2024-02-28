import {Measure} from '../organization/Measure';
import {IPolarMeasureValue} from '../polar/IPolarMeasureValue';
import {ICartesianMeasureValue} from '../cartesian/ICartesianMeasureValue';

/**
 *  api/radars/:id/measures/:id
 */
export class RadarMeasure extends Measure {

    public static TYPE = 'radar-measure';

    constructor(json: {
                    id: string,
                    values: IPolarMeasureValue[] | ICartesianMeasureValue[] | Measure[] | number[],
                    date?: Date,
                    validity?: number
                }
    ) {
        super(json);
    }

    protected getLinkType(): string {
        return RadarMeasure.TYPE;
    }
}

