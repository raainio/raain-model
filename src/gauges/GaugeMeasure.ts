import {Measure} from '../organizations/Measure';
import {IPolarMeasureValue} from '../polars/IPolarMeasureValue';
import {ICartesianMeasureValue} from '../cartesians/ICartesianMeasureValue';
import {GaugeNode} from './GaugeNode';


/**
 *  // api/gauges/:id/measures/:id
 */
export class GaugeMeasure extends Measure {

    constructor(
        idOrObjectToCopy: any | string,
        date?: Date,
        values?: IPolarMeasureValue[] | ICartesianMeasureValue[] | Measure[] | number[],
        validity?: number
    ) {
        super(idOrObjectToCopy, date, values, validity);
        if (typeof (idOrObjectToCopy) === 'object') {
            if (idOrObjectToCopy.gauge) {
                this.addLinks([new GaugeNode(idOrObjectToCopy.gauge)]);
            }
        }
    }

    protected getLinkType(): string {
        return 'gauge-measure';
    }
}

