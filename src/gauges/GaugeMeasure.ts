import {Measure} from '../organizations/Measure';


/**
 *  // api/gauges/:id/measures/:id
 */
export class GaugeMeasure extends Measure {

    protected getLinkType(): string {
        return 'gauge-measure';
    }
}

