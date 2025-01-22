import {Link, RaainNode, TeamNode} from '../organization';
import {RadarNode} from '../radar';
import {RainComputation} from './RainComputation';
import {GaugeNode} from '../gauge';
import {LatLng} from '../cartesian';

/**
 * api/rains/:id
 */
export class RainNode extends RaainNode {

    public static TYPE = 'rain';

    public name: string;
    public description: string;
    public team: TeamNode;
    public status: number;
    public quality: number;
    public latLngRectsAsJSON: string;

    // internal
    private configurationAsJSON: string;

    constructor(json: {
        id: string,
        name: string,
        team: TeamNode,
        description?: string,
        links?: Link[] | RaainNode[],
        version?: string,
        status?: number,
        quality?: number,
        radars?: RadarNode[],
        gauges?: GaugeNode[],
        latLngRectsAsJSON?: string,
        configurationAsJSON?: any,
        lastCompletedComputations?: RainComputation[],
    }) {
        super(json);

        const links = json?.links ? json.links as any[] : [];

        this.name = json.name;
        this.description = json.description;
        this.team = json.team;
        this.status = json.status >= 0 ? json.status : -1;
        this.quality = json.quality >= 0 ? json.quality : -1;
        this.latLngRectsAsJSON = json.latLngRectsAsJSON;

        this.addRadars(links.filter(l => l instanceof RadarNode));
        this.addRadars(json.radars);
        this.addGauges(links.filter(l => l instanceof GaugeNode));
        this.addGauges(json.gauges);
        this.setConfiguration(json.configurationAsJSON);
        this.addCompletedComputations(links.filter(l => l instanceof RainComputation));
        this.addCompletedComputations(json.lastCompletedComputations);
    }

    private static _getRadarLinks(linksToPurify: any[]): any[] {
        if (!linksToPurify || linksToPurify.length === 0) {
            return [];
        }

        const linksPurified = linksToPurify.map(l => {
            if (l instanceof Link) {
                return l;
            } else if (l && l['_id']) {
                return new RadarNode({id: l['_id'].toString(), latitude: l.latitude, longitude: l.latitude, name: l.name, team: l.team});
            } else if (l && l.id) {
                return new RadarNode({id: l.id.toString(), latitude: l.latitude, longitude: l.longitude, name: l.name, team: l.team});
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
                    date: l.date, version: l.version,
                    isReady: null, results: null,
                });
            } else if (l && l.id) {
                return new RainComputation({
                    id: l.id.toString(),
                    date: l.date, version: l.version,
                    isReady: null, results: null
                });
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
                return new GaugeNode({id: l['_id'].toString(), latitude: l.latitude, longitude: l.longitude, name: l.name, team: l.team});
            } else if (l && l.id) {
                return new GaugeNode({id: l.id.toString(), latitude: l.latitude, longitude: l.longitude, name: l.name, team: l.team});
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

        if (conf) {
            this.configurationAsJSON = JSON.stringify(conf);
        }
    }

    public getConfiguration(): any {
        try {
            return JSON.parse(this.configurationAsJSON);
        } catch (e) {
        }
        return null;
    }

    public toJSON(): any {
        const json = super.toJSON();
        json['name'] = this.name;
        json['description'] = this.description;
        json['status'] = this.status;
        json['quality'] = this.quality;
        json['team'] = this.team?.id || this.team;
        json['latLngRectsAsJSON'] = this.latLngRectsAsJSON;
        json['configurationAsJSON'] = this.configurationAsJSON;
        json['radars'] = this.getLinks().filter(l => l.getLinkType() === RadarNode.TYPE).map(l => l.getId());
        json['gauges'] = this.getLinks().filter(l => l.getLinkType() === GaugeNode.TYPE).map(l => l.getId());
        json['lastCompletedComputations'] = this.getLinks().filter(l => l.getLinkType() === RainComputation.TYPE).map(l => l.getId());
        return json;
    }

    public addRadars(linksToAdd: Link[] | RadarNode[]): void {
        this.addLinks(RainNode._getRadarLinks(linksToAdd));
        this.setDefaultLatLng(linksToAdd);
    }

    public addCompletedComputations(linksToAdd: Link[] | RainComputation[]): void {
        this.addLinks(RainNode._getRainComputationLinks(linksToAdd));
    }

    public addGauges(linksToAdd: Link[] | GaugeNode[]): void {
        this.addLinks(RainNode._getGaugeLinks(linksToAdd));
    }

    public getCenter(): LatLng {

        let center = new LatLng({lat: 0, lng: 0});
        this.setDefaultLatLng(this['radars']);
        if (this.latLngRectsAsJSON && this.latLngRectsAsJSON !== '[]') {
            const rects = JSON.parse(this.latLngRectsAsJSON);
            let latMax: number, lngMax: number, latMin: number, lngMin: number;
            for (const rect of rects) {
                const topLeft = rect[0];
                const bottomRight = rect[1];
                latMax = typeof latMax === 'undefined' ? topLeft.lat : Math.max(topLeft.lat, latMax);
                lngMin = typeof lngMin === 'undefined' ? topLeft.lng : Math.min(topLeft.lng, lngMin);
                latMin = typeof latMin === 'undefined' ? bottomRight.lat : Math.min(bottomRight.lat, latMin);
                lngMax = typeof lngMax === 'undefined' ? bottomRight.lng : Math.max(bottomRight.lng, lngMax);
            }

            center = new LatLng({lat: ((latMax - latMin) / 2) + latMin, lng: ((lngMax - lngMin) / 2) + lngMin})
        }

        return center;
    }

    public getLimitPoints(): [LatLng, LatLng] {
        let limitPoints: [LatLng, LatLng];
        this.setDefaultLatLng(this['radars']);
        if (this.latLngRectsAsJSON && this.latLngRectsAsJSON !== '[]') {
            const rects = JSON.parse(this.latLngRectsAsJSON);
            let latMax: number, lngMax: number, latMin: number, lngMin: number;
            for (const rect of rects) {
                const rectA = rect[0];
                const rectB = rect[1];
                latMax = Math.max(rectA.lat, rectB.lat, typeof latMax !== 'undefined' ? latMax : rectA.lat);
                lngMin = Math.min(rectA.lng, rectB.lng, typeof lngMin !== 'undefined' ? lngMin : rectA.lng);
                latMin = Math.min(rectA.lat, rectB.lat, typeof latMin !== 'undefined' ? latMin : rectB.lat);
                lngMax = Math.max(rectA.lng, rectB.lng, typeof lngMax !== 'undefined' ? lngMax : rectB.lng);
            }

            limitPoints = [new LatLng({lat: latMin, lng: lngMin}), new LatLng({lat: latMax, lng: lngMax})];
        }

        return limitPoints;
    }

    protected getLinkType(): string {
        return RainNode.TYPE;
    }

    private setDefaultLatLng(radars: any[]) {
        // put a default latLngRectsAsJSON
        if (radars?.length && (!this.latLngRectsAsJSON || this.latLngRectsAsJSON === '[]')) {
            const latLngRects = [];
            for (const radarNode of radars) {
                if (radarNode instanceof RadarNode) {
                    latLngRects.push([
                        new LatLng({lat: radarNode.latitude + 1, lng: radarNode.longitude - 1}),
                        new LatLng({lat: radarNode.latitude - 1, lng: radarNode.longitude + 1})]);
                }
            }

            this.latLngRectsAsJSON = JSON.stringify(latLngRects);
        }
    }
}
