import {RaainNode} from "./RaainNode";
import {Link} from "./Link";
import {RadarNode} from "./RadarNode";
import {RainNode} from "./RainNode";
import {RadarMeasure} from "./RadarMeasure";
import {RainMeasureValue} from "./RainMeasureValue";

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

    public results: RainMeasureValue[]; // why array ? because you can have different angle for Radar (same as Measure)

    constructor(
        idOrObjectToCopy: string | {
            id?: string,
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
            launchedBy?: string,
            rain?: Link[],
            radars?: Link[]
        },
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
        if (typeof idOrObjectToCopy !== 'string') {
            this.periodBegin = idOrObjectToCopy.periodBegin;
            this.periodEnd = idOrObjectToCopy.periodEnd;
            this.quality = idOrObjectToCopy.quality;
            this.progressIngest = idOrObjectToCopy.progressIngest;
            this.progressComputing = idOrObjectToCopy.progressComputing;
            this.timeSpentInMs = idOrObjectToCopy.timeSpentInMs;
            this.isReady = idOrObjectToCopy.isReady;
            this.isDoneDate = idOrObjectToCopy.isDoneDate;
            this.setResults(idOrObjectToCopy.results);
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
        this.setResults(results);
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
        json['results'] = JSON.stringify(this.results.map(r => r.toJSON()));
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

    private setResults(results) {
        if (typeof results === 'string') {
            results = JSON.parse(results);
        }

        if (!results || results.length === 0) {
            this.results = [];
            return;
        }

        this.results = results.map(r => {
            if (typeof r === 'string') {
                return new RainMeasureValue(r);
            } else if (r.getPolarsStringified) {
                return new RainMeasureValue(r.getPolarsStringified());
            } else if (r.polars) {
                return new RainMeasureValue(r);
            } else {
                return r;
            }
        });
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

