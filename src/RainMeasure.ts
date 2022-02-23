import {Measure} from "./Measure";

export class RainMeasure extends Measure {

    public static TYPE = 'rain-measure';

    protected getLinkType(): string {
        return RainMeasure.TYPE;
    }
}

