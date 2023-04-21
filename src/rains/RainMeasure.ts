import {Measure} from "../organizations/Measure";

/**
 *  // not existing? api/rains/:id/measures/:id
 *  but coming from api/rains/:id/computations/:id?format=map => getMapData()
 */
export class RainMeasure extends Measure {

    public static TYPE = 'rain-measure';

    protected getLinkType(): string {
        return RainMeasure.TYPE;
    }
}

