import {Position} from '../position/Position';


export class PositionValue extends Position {
    public value: number;

    constructor(json: {
        x: number,
        y: number,
        value: number
    }) {
        super(json);
        this.value = json.value;
    }
}
