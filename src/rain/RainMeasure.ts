import {Measure} from '../organization/Measure';
import {IPolarMeasureValue} from '../polar/IPolarMeasureValue';
import {ICartesianMeasureValue} from '../cartesian/ICartesianMeasureValue';

/**
 *  api/rains/:id/computations/:id?format=map => RainComputationMap getMapData()
 */
export class RainMeasure extends Measure {

    public static TYPE = 'rain-measure';

    constructor(json: {
        id: string,
        values: IPolarMeasureValue[] | ICartesianMeasureValue[] | number[],
        date?: Date,
        validity?: number,
        configurationAsJSON?: string,
    }) {
        super(json);
    }

    protected getLinkType(): string {
        return RainMeasure.TYPE;
    }
}
