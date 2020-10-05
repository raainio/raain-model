import {Measure} from "./Measure";

export class RainMeasure extends Measure {

    protected getLinkType(): string {
        return 'rain-measure';
    }
}

