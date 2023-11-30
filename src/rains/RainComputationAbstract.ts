import {RaainNode} from '../organizations/RaainNode';
import {Link} from '../organizations/Link';
import {RadarNode} from '../radars/RadarNode';
import {RainNode} from './RainNode';
import {RadarMeasure} from '../radars/RadarMeasure';

/**
 *  not used directly
 */
export class RainComputationAbstract extends RaainNode {

    public static TYPE = 'rain-computation';
    public quality: number;
    public progressIngest: number;
    public progressComputing: number;
    public timeSpentInMs: number;
    public periodBegin: Date;
    public periodEnd: Date;
    public isReady: boolean;
    public isDoneDate: Date;
    public launchedBy: string;
    public name: string;

    constructor(
        // public values: IPolarMeasureValue[] | ICartesianMeasureValue[] | number[];
        idOrObjectToCopy: string | {
            id?: string,
            periodBegin?: Date,
            periodEnd?: Date,
            links?: Link[] | RaainNode[],
            quality?: number,
            progressIngest?: number,
            progressComputing?: number,
            timeSpentInMs?: number,
            isReady?: boolean,
            isDoneDate?: Date,
            launchedBy?: string,
            version?: string,
            rain?: RaainNode[],
            radars?: Link[] | RaainNode[],
        },
        periodBegin?: Date,
        periodEnd?: Date,
        links?: Link[] | RaainNode[],
        quality?: number,
        progressIngest?: number,
        progressComputing?: number,
        timeSpentInMs?: number,
        isReady?: boolean,
        isDoneDate?: Date,
        launchedBy?: string,
        version?: string,
    ) {
        super(idOrObjectToCopy, links, version);
        if (typeof idOrObjectToCopy !== 'string') {
            this.periodBegin = idOrObjectToCopy.periodBegin;
            this.periodEnd = idOrObjectToCopy.periodEnd;
            this.quality = idOrObjectToCopy.quality;
            this.progressIngest = idOrObjectToCopy.progressIngest;
            this.progressComputing = idOrObjectToCopy.progressComputing;
            this.timeSpentInMs = idOrObjectToCopy.timeSpentInMs;
            this.isReady = idOrObjectToCopy.isReady;
            this.isDoneDate = idOrObjectToCopy.isDoneDate;
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
        this.launchedBy = launchedBy;

        this.replaceRainLink(links);
        this.addRadarLinks(links);
    }

    private static _getRadarLinks(linksToPurify: any[]): any[] {
        if (!linksToPurify || linksToPurify.length === 0) {
            return [];
        }

        return linksToPurify.map(l => {
            if (l instanceof Link) {
                return l;
            } else if (l && l._id) {
                return new RadarNode(l._id.toString());
            } else if (l && l.id) {
                return new RadarNode(l.id.toString()); // 'hex'
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
            } else if (l && l._id) {
                return new RadarMeasure(l._id.toString());
            } else if (l && l.id) {
                return new RadarMeasure(l.id.toString()); // 'hex'
            }
        });
    }

    private static _getRainLink(linkToPurify: RaainNode): RainNode {
        if (!linkToPurify || !linkToPurify.id) {
            return null;
        }

        return new RainNode(linkToPurify.id.toString()); // 'hex'
    }

    public toJSON(): JSON {
        const json = super.toJSON();
        json['periodBegin'] = this.periodBegin;
        json['periodEnd'] = this.periodEnd;
        json['quality'] = this.quality;
        json['progressIngest'] = this.progressIngest;
        json['progressComputing'] = this.progressComputing;
        json['timeSpentInMs'] = this.timeSpentInMs;
        json['isReady'] = this.isReady;
        json['isDoneDate'] = this.isDoneDate;
        json['launchedBy'] = this.launchedBy;
        json['name'] = this.name;
        return json;
    }

    public addRadarLinks(linksToAdd: Link[] | RaainNode[]): void {
        this.addLinks(RainComputationAbstract._getRadarLinks(linksToAdd));
    }

    public replaceRainLink(linksToAdd: Link | RaainNode | any): void {
        this.addLinks([RainComputationAbstract._getRainLink(linksToAdd)]);
    }

    public addRadarMeasureLinks(linksToAdd: Link[] | any[]): void {
        this.addLinks(RainComputationAbstract._getRadarMeasureLinks(linksToAdd));
    }

    protected getLinkType(): string {
        return RainComputationAbstract.TYPE;
    }

}

