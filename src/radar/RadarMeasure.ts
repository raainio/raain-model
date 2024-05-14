import {Measure} from '../organization/Measure';
import {IPolarMeasureValue} from '../polar/IPolarMeasureValue';
import {ICartesianMeasureValue} from '../cartesian/ICartesianMeasureValue';
import {RadarMeasureConfiguration} from '../configuration/RadarMeasureConfiguration';

/**
 *  api/radars/:id/measures/:id
 */
export class RadarMeasure extends Measure {

    public static TYPE = 'radar-measure';

    constructor(json: {
                    id: string,
                    values: IPolarMeasureValue[] | ICartesianMeasureValue[] | Measure[] | number[],
                    date?: Date,
                    validity?: number,
                    configurationAsJSON?: string | RadarMeasureConfiguration,
                }
    ) {
        super(json);
    }

    protected getLinkType(): string {
        return RadarMeasure.TYPE;
    }
}

