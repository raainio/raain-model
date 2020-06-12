import { IMeasureValue } from "./IMeasureValue";
import { RaainNode } from "./RaainNode";
export declare class Measure extends RaainNode {
    date: Date;
    values: IMeasureValue[];
    validity: number;
    constructor(idOrObjectToCopy: any | string, date?: Date, values?: IMeasureValue[], validity?: number);
    toJSON(): Object;
}
