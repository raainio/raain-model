import {Measure} from './Measure';


/**
 *  // api/radars/:id/measures/:id
 */
export class RadarMeasure extends Measure {

    protected getLinkType(): string {
        return 'radar-measure';
    }
}

