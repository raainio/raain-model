import {RaainNode} from '../organization/RaainNode';
import {Link} from '../organization/Link';
import {RadarNode} from '../radar/RadarNode';
import {RainNode} from './RainNode';
import {RadarMeasure} from '../radar/RadarMeasure';

/**
 *  not used directly
 */
export class RainComputationAbstract extends RaainNode {

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

    constructor(json: {
        id: string,
        periodBegin: Date,
        periodEnd: Date,
        isReady: boolean,

        links?: Link[] | RaainNode[],
        version?: string,
        quality?: number,
        progressIngest?: number,
        progressComputing?: number,
        timeSpentInMs?: number,
        isDoneDate?: Date,
        launchedBy?: string,
        rain?: RaainNode[],
        radars?: Link[] | RaainNode[],

    }) {
        super(json);

        this.periodBegin = new Date(json.periodBegin);
        this.periodEnd = new Date(json.periodEnd);
        this.quality = json.quality >= 0 ? json.quality : -1;
        this.progressIngest = json.progressIngest >= 0 ? json.progressIngest : -1;
        this.progressComputing = json.progressComputing >= 0 ? json.progressComputing : -1;
        this.timeSpentInMs = json.timeSpentInMs;
        this.isReady = !!json.isReady;
        this.isDoneDate = json.isDoneDate ? new Date(json.isDoneDate) : undefined;
        this.launchedBy = json.launchedBy;

        this.replaceRainLink(json.links);
        this.replaceRainLink(json.rain);
        this.addRadarLinks(json.links);
        this.addRadarLinks(json.radars);
    }

    private static _getRadarLinks(linksToPurify: any[]): any[] {
        if (!linksToPurify || linksToPurify.length === 0) {
            return [];
        }

        return linksToPurify.map(l => {
            if (l instanceof Link) {
                return l;
            } else if (l && l['_id']) {
                return new RadarNode({id: l['_id'].toString(), latitude: 0, longitude: 0, name: l['name']});
            } else if (l && l.id) {
                return new RadarNode({
                    id: l.id.toString(),// 'hex'
                    latitude: 0, longitude: 0, name: l['name']
                });
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
            } else if (l && l['_id']) {
                return new RadarMeasure({id: l['_id'].toString(), values: []});
            } else if (l && l.id) {
                return new RadarMeasure({id: l.id.toString(), values: []}); // 'hex'
            }
        });
    }

    private static _getRainLink(linkToPurify: RaainNode): RainNode {
        if (!linkToPurify || !linkToPurify.id) {
            return null;
        }

        return new RainNode({
            id: linkToPurify.id.toString(), // 'hex'
            latitude: 0, longitude: 0
        });
    }

    public toJSON(): JSON {
        const json = super.toJSON();
        json['periodBegin'] = this.periodBegin.toISOString();
        json['periodEnd'] = this.periodEnd.toISOString();
        json['quality'] = this.quality;
        json['progressIngest'] = this.progressIngest;
        json['progressComputing'] = this.progressComputing;
        json['timeSpentInMs'] = this.timeSpentInMs;
        json['isReady'] = this.isReady;
        json['isDoneDate'] = this.isDoneDate?.toISOString();
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
        throw Error('abstract');
    }

}
