import {Measure} from '../organizations/Measure';
import {IPolarMeasureValue} from '../polars/IPolarMeasureValue';
import {ICartesianMeasureValue} from '../cartesians/ICartesianMeasureValue';
import {RainNode} from './RainNode';

/**
 *  // not existing? api/rains/:id/measures/:id
 *  but coming from api/rains/:id/computations/:id?format=map => getMapData()
 */
export class RainMeasure extends Measure {

    public static TYPE = 'rain-measure';

    constructor(
        idOrObjectToCopy: any | string,
        date?: Date,
        values?: IPolarMeasureValue[] | ICartesianMeasureValue[] | Measure[] | number[],
        validity?: number
    ) {
        super(idOrObjectToCopy, date, values, validity);
        if (typeof (idOrObjectToCopy) === 'object') {
            if (idOrObjectToCopy.rain) {
                this.addLinks([new RainNode(idOrObjectToCopy.rain)]);
            }
        }
    }

    protected getLinkType(): string {
        return RainMeasure.TYPE;
    }
}

