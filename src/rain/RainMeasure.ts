import {Measure} from '../organization/Measure';
import {IPolarMeasureValue} from '../polar/IPolarMeasureValue';
import {ICartesianMeasureValue} from '../cartesian/ICartesianMeasureValue';
import {MeasureConfiguration} from '../configuration/MeasureConfiguration';

/**
 *  // not existing? api/rains/:id/measures/:id
 *  but coming from api/rains/:id/computations/:id?format=map => getMapData()
 */
export class RainMeasure extends Measure {

    public static TYPE = 'rain-measure';

    constructor(json: {
        id: string,
        values: IPolarMeasureValue[] | ICartesianMeasureValue[] | Measure[] | number[],
        date?: Date,
        validity?: number,
        configurationAsJSON?: string | MeasureConfiguration,
    }) {
        super(json);
    }

    protected getLinkType(): string {
        return RainMeasure.TYPE;
    }
}

