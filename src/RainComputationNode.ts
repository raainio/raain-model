import {RaainNode} from "./RaainNode";
import {Link} from "./Link";
import {RadarNode} from "./RadarNode";
import {RainNode} from "./RainNode";
import {RadarMeasure} from "./RadarMeasure";
import {RainMeasureValue} from "./RainMeasureValue";

// api/rains/:id/computations/:id
export class RainComputationNode extends RaainNode {

    public quality: number;
    public progressIngest: number;
    public progressComputing: number;
    public timeSpentInMs: number;

    public periodBegin: Date;
    public periodEnd: Date;
    public isReady: Boolean;
    public isDoneDate: Date;
    public launchedBy: String;

    public results: RainMeasureValue[];

    constructor(
        idOrObjectToCopy: any | string,
        periodBegin?: Date,
        periodEnd?: Date,
        links?: Link[] | any[],
        quality?: number,
        progressIngest?: number,
        progressComputing?: number,
        timeSpentInMs?: number,
        isReady?: Boolean,
        isDoneDate?: Date,
        results?: RainMeasureValue[],
        launchedBy?: string
    ) {
        super(idOrObjectToCopy, links);

        if (typeof (idOrObjectToCopy.id) !== 'undefined') {
            this.periodBegin = idOrObjectToCopy.periodBegin;
            this.periodEnd = idOrObjectToCopy.periodEnd;
            this.quality = idOrObjectToCopy.quality;
            this.progressIngest = idOrObjectToCopy.progressIngest;
            this.progressComputing = idOrObjectToCopy.progressComputing;
            this.timeSpentInMs = idOrObjectToCopy.timeSpentInMs;
            this.isReady = idOrObjectToCopy.isReady;
            this.isDoneDate = idOrObjectToCopy.isDoneDate;
            this.results = idOrObjectToCopy.results;
            this.launchedBy = idOrObjectToCopy.launchedBy;
            this.replaceRainLink(idOrObjectToCopy.links);
            this.replaceRainLink(idOrObjectToCopy.rain);
            this.addRadarLinks(idOrObjectToCopy.links);
            this.addRadarLinks(idOrObjectToCopy.radars);
            return;
        }

        this.periodBegin = periodBegin;
        this.periodEnd = periodEnd;
        this.quality = quality;
        this.progressIngest = progressIngest;
        this.progressComputing = progressComputing;
        this.timeSpentInMs = timeSpentInMs;
        this.isReady = isReady;
        this.isDoneDate = isDoneDate;
        this.results = results;
        this.launchedBy = launchedBy;
        this.replaceRainLink(links);
        this.addRadarLinks(links);
    }

    public toJSON(): Object {
        let json = super.toJSON();
        json['periodBegin'] = this.periodBegin;
        json['periodEnd'] = this.periodEnd;
        json['quality'] = this.quality;
        json['progressIngest'] = this.progressIngest;
        json['progressComputing'] = this.progressComputing;
        json['timeSpentInMs'] = this.timeSpentInMs;
        json['isReady'] = this.isReady;
        json['isDoneDate'] = this.isDoneDate;
        json['results'] = this.results;
        json['launchedBy'] = this.launchedBy;
        return json;
    }

    protected getLinkType(): string {
        return 'rain-computation';
    }

    public addRadarLinks(linksToAdd: Link[] | any[]): void {
        this.addLinks(RainComputationNode._getRadarLinks(linksToAdd));
    }

    public replaceRainLink(linksToAdd: Link[] | any[] | any): void {
        this.addLinks([RainComputationNode._getRainLink(linksToAdd)]);
    }

    public addRadarMeasureLinks(linksToAdd: Link[] | any[]): void {
        this.addLinks(RainComputationNode._getRadarMeasureLinks(linksToAdd));
    }

    private static _getRadarLinks(linksToPurify: any[]): any[] {
        if (!linksToPurify || linksToPurify.length === 0) {
            return [];
        }

        return linksToPurify.map(l => {
            if (l instanceof Link) {
                return l;
            } else if (l && l.id) {
                return new RadarNode(l.id.toString('hex'));
            }
        });
    }

    private static _getRadarMeasureLinks(linksToPurify: any[]): any[] {
        if (!linksToPurify || linksToPurify.length === 0) {
            return [];
        }

        return linksToPurify.map(l => {
            if (l instanceof Link) {
                return l;
            } else if (l && l.id) {
                return new RadarMeasure(l.id.toString('hex'));
            }
        });
    }

    private static _getRainLink(linkToPurify: any): RainNode {
        if (!linkToPurify || !linkToPurify.id) {
            return null;
        }

        return new RainNode(linkToPurify.id.toString('hex'));
    }

}
