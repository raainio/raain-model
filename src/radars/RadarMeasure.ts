import {Measure} from '../organizations/Measure';
import {IPolarMeasureValue} from '../polars/IPolarMeasureValue';
import {ICartesianMeasureValue} from '../cartesians/ICartesianMeasureValue';
import {RadarNode} from './RadarNode';


/**
 *  api/radars/:id/measures/:id
 */
export class RadarMeasure extends Measure {

    public static TYPE = 'radar-measure';

    constructor(
        idOrObjectToCopy: any | string,
        date?: Date,
        values?: IPolarMeasureValue[] | ICartesianMeasureValue[] | Measure[] | number[],
        validity?: number
    ) {
        super(idOrObjectToCopy, date, values, validity);
        if (typeof (idOrObjectToCopy) === 'object') {
            if (idOrObjectToCopy.radar) {
                this.addLinks([new RadarNode(idOrObjectToCopy.radar)]);
            }
        }
    }

    protected getLinkType(): string {
        return RadarMeasure.TYPE;
    }
}

