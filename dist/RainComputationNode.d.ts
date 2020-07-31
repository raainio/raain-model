import { RaainNode } from "./RaainNode";
import { Link } from "./Link";
import { RainMeasureValue } from "./RainMeasureValue";
export declare class RainComputationNode extends RaainNode {
    quality: number;
    progressIngest: number;
    progressComputing: number;
    timeSpentInMs: number;
    periodBegin: Date;
    periodEnd: Date;
    isReady: Boolean;
    isDoneDate: Date;
    launchedBy: String;
    results: RainMeasureValue[];
    constructor(idOrObjectToCopy: string | {
        id?: string;
        periodBegin?: Date;
        periodEnd?: Date;
        links?: Link[] | any[];
        quality?: number;
        progressIngest?: number;
        progressComputing?: number;
        timeSpentInMs?: number;
        isReady?: Boolean;
        isDoneDate?: Date;
        results?: RainMeasureValue[];
        launchedBy?: string;
        rain?: Link[];
        radars?: Link[];
    }, periodBegin?: Date, periodEnd?: Date, links?: Link[] | any[], quality?: number, progressIngest?: number, progressComputing?: number, timeSpentInMs?: number, isReady?: Boolean, isDoneDate?: Date, results?: RainMeasureValue[], launchedBy?: string);
    toJSON(): Object;
    protected getLinkType(): string;
    addRadarLinks(linksToAdd: Link[] | any[]): void;
    replaceRainLink(linksToAdd: Link[] | any[] | any): void;
    addRadarMeasureLinks(linksToAdd: Link[] | any[]): void;
    private static _getRadarLinks(linksToPurify);
    private static _getRadarMeasureLinks(linksToPurify);
    private static _getRainLink(linkToPurify);
}
