import {Measure} from '../organization';
import {IPolarMeasureValue} from '../polar';
import {ICartesianMeasureValue} from '../cartesian';

/**
 *  api/rains/:id/computations/:id?format=map => RainComputationMap getMapData() => RainMeasure[]
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
