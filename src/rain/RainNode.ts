import {RaainNode} from '../organization/RaainNode';
import {Link} from '../organization/Link';
import {RadarNode} from '../radar/RadarNode';
import {RainComputation} from './RainComputation';
import {GaugeNode} from '../gauge/GaugeNode';

/**
 * api/rains/:id
 */
export class RainNode extends RaainNode {

    public static TYPE = 'rain';

    public name: string;
    public status: number;
    public quality: number;
    public latitude: number;
    public longitude: number;
    private configurationAsJSON: string;

    constructor(json: {
        id: string,
        latitude: number | string,
        longitude: number | string,
        name?: string,
        links?: Link[] | RaainNode[],
        version?: string,
        status?: number,
        quality?: number,
        radars?: any[],
        lastCompletedComputations?: any[],
        gauges?: any[],
        configurationAsJSON?: any,
    }) {
        super(json);
        this.name = json.name;
        this.latitude = typeof json.latitude === 'string' ? parseFloat(json.latitude) : json.latitude;
        this.longitude = typeof json.longitude === 'string' ? parseFloat(json.longitude) : json.longitude;
        this.status = json.status >= 0 ? json.status : -1;
        this.quality = json.quality >= 0 ? json.quality : -1;
        this.addRadars(json.links);
        this.addRadars(json.radars);
        this.addCompletedComputations(json.links);
        this.addCompletedComputations(json.lastCompletedComputations);
        this.addGauges(json.links);
        this.addGauges(json.gauges);
        this.setConfiguration(json.configurationAsJSON);
    }

    private static _getRadarLinks(linksToPurify: any[]): any[] {
        if (!linksToPurify || linksToPurify.length === 0) {
            return [];
        }

        const linksPurified = linksToPurify.map(l => {
            if (l instanceof Link) {
                return l;
            } else if (l && l['_id']) {
                return new RadarNode({id: l['_id'].toString(), latitude: 0, longitude: 0, name: l['name']});
            } else if (l && l.id) {
                return new RadarNode({id: l.id.toString(), latitude: 0, longitude: 0, name: l['name']}); // 'hex'
            }
        });

        return linksPurified.filter(l => !!l);
    }

    private static _getRainComputationLinks(linksToPurify: any[]): any[] {
        if (!linksToPurify || linksToPurify.length === 0) {
            return [];
        }

        const linksPurified = linksToPurify.map(l => {
            if (l instanceof Link) {
                return l;
            } else if (l && l['_id']) {
                return new RainComputation({
                    id: l['_id'].toString(),
                    periodBegin: null, periodEnd: null, isReady: null, results: null
                });
            } else if (l && l.id) {
                return new RainComputation({
                    id: l.id.toString(),
                    periodBegin: null, periodEnd: null, isReady: null, results: null
                }); // 'hex'
            }
        });

        return linksPurified.filter(l => !!l);
    }

    private static _getGaugeLinks(linksToPurify: any[]): any[] {
        if (!linksToPurify || linksToPurify.length === 0) {
            return [];
        }

        const linksPurified = linksToPurify.map(l => {
            if (l instanceof Link) {
                return l;
            } else if (l && l['_id']) {
                return new GaugeNode({id: l['_id'].toString(), latitude: 0, longitude: 0});
            } else if (l && l.id) {
                return new GaugeNode({id: l.id.toString(), latitude: 0, longitude: 0}); // 'hex'
            }
        });

        return linksPurified.filter(l => !!l);
    }

    public setConfiguration(configuration: string | any) {
        let conf = configuration;
        try {
            conf = JSON.parse(configuration);
        } catch (ignored) {
        }

        this.configurationAsJSON = JSON.stringify(conf);
    }

    public toJSON(): JSON {
        const json = super.toJSON();
        json['name'] = this.name;
        json['status'] = this.status;
        json['quality'] = this.quality;
        json['latitude'] = this.latitude;
        json['longitude'] = this.longitude;
        json['configurationAsJSON'] = this.configurationAsJSON;
        return json;
    }

    public addRadars(linksToAdd: Link[] | any[]): void {
        this.addLinks(RainNode._getRadarLinks(linksToAdd));
    }

    public addCompletedComputations(linksToAdd: Link[] | any[]): void {
        this.addLinks(RainNode._getRainComputationLinks(linksToAdd));
    }

    public addGauges(linksToAdd: Link[] | any[]): void {
        this.addLinks(RainNode._getGaugeLinks(linksToAdd));
    }

    public getConfiguration(): any {
        try {
            return JSON.parse(this.configurationAsJSON);
        } catch (e) {
        }
        return null;
    }

    protected getLinkType(): string {
        return RainNode.TYPE;
    }
}
