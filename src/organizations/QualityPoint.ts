import {CartesianValue} from '../cartesians/CartesianValue';

export class QualityPoint {

    constructor(
        public gaugeId: string,
        public gaugeDate: Date,
        public rainDate: Date,
        public gaugeCartesianValue: CartesianValue,
        public rainCartesianValue: CartesianValue,
        public speed: { x: number, y: number },
    ) {
    }


}
