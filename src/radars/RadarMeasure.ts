import {Measure} from '../organizations/Measure';


/**
 *  api/radars/:id/measures/:id
 */
export class RadarMeasure extends Measure {

    public static TYPE = 'radar-measure';

    protected getLinkType(): string {
        return RadarMeasure.TYPE;
    }
}

