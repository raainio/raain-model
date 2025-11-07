import {Link, RaainNode, RaainNodeType, TeamNode} from '../organization';
import {RadarNode} from '../radar';
import {RainComputation} from './RainComputation';
import {GaugeNode} from '../gauge';
import {CartesianTools, LatLng} from '../cartesian';

/**
 * api/rains/:id
 */
export class RainNode extends RaainNode {
    public static TYPE = RaainNodeType.RainNode;

    public name: string;
    public description: string;
    public team: TeamNode;
    public status: number;
    public quality: number;
    public latLngRectsAsJSON: string;

    // internal
    private configurationAsJSON: string;

    constructor(json: {
        id: string;
        name: string;
        team: string | TeamNode;
        description?: string;
        links?: Link[] | RaainNode[];
        version?: string;
        status?: number;
        quality?: number;
        radars?: string[] | RadarNode[];
        gauges?: string[] | GaugeNode[];
        latLngRectsAsJSON?: string;
        configurationAsJSON?: string;
        lastCompletedComputations?: string[] | RainComputation[];
    }) {
        super(json);

        const links = json?.links ? (json.links as any[]) : [];

        this.name = json.name;
        this.description = json.description;
        this.team = json.team as TeamNode;
        if (typeof json.team === 'string') {
            this.team = new TeamNode({id: json.team});
        }

        this.status = json.status >= 0 ? json.status : -1;
        this.quality = json.quality >= 0 ? json.quality : -1;
        this.latLngRectsAsJSON = json.latLngRectsAsJSON;

        this.addRadars(links.filter((l) => l instanceof RadarNode));
        this.addRadars(json.radars);
        this.addGauges(links.filter((l) => l instanceof GaugeNode));
        this.addGauges(json.gauges);
        this.setConfiguration(json.configurationAsJSON);
        this.addCompletedComputations(links.filter((l) => l instanceof RainComputation));
        this.addCompletedComputations(json.lastCompletedComputations);
    }

    private static _getRainComputationLinks(linksToPurify: any[]): any[] {
        if (!linksToPurify || linksToPurify.length === 0) {
            return [];
        }

        const linksPurified = linksToPurify.map((l) => {
            if (l instanceof Link) {
                return l;
            } else if (l && l['_id']) {
                return new RainComputation({
                    id: l['_id'].toString(),
                    date: l.date,
                    version: l.version,
                    isReady: null,
                    results: null,
                });
            } else if (l && l.id) {
                return new RainComputation({
                    id: l.id.toString(),
                    date: l.date,
                    version: l.version,
                    isReady: null,
                    results: null,
                });
            }
        });

        return linksPurified.filter((l) => !!l);
    }

    private static _getGaugeLinks(linksToPurify: any[]): any[] {
        if (!linksToPurify || linksToPurify.length === 0) {
            return [];
        }

        const linksPurified = linksToPurify.map((l) => {
            if (l instanceof Link) {
                return l;
            } else if (l && l['_id']) {
                return new GaugeNode({
                    id: l['_id'].toString(),
                    latitude: l.latitude,
                    longitude: l.longitude,
                    name: l.name,
                    team: l.team,
                });
            } else if (l && l.id) {
                return new GaugeNode({
                    id: l.id.toString(),
                    latitude: l.latitude,
                    longitude: l.longitude,
                    name: l.name,
                    team: l.team,
                });
            }
        });

        return linksPurified.filter((l) => !!l);
    }

    public setConfiguration(configuration: string | any) {
        let conf = configuration;
        try {
            conf = JSON.parse(configuration);
        } catch (ignored) {
            // Ignore parsing errors, use the original value
        }

        if (conf) {
            this.configurationAsJSON = JSON.stringify(conf);
        }
    }

    public getConfiguration(): any {
        return RaainNode.parseJsonLikeOrNull(this.configurationAsJSON);
    }

    public toJSON() {
        const json = super.toJSON();
        return {
            ...json,
            name: this.name,
            description: this.description,
            status: this.status,
            quality: this.quality,
            team: this.team?.id || this.team,
            latLngRectsAsJSON: this.latLngRectsAsJSON,
            configurationAsJSON: this.configurationAsJSON,
            radars: this.links
                .filter((l) => l.getLinkType() === RadarNode.TYPE)
                .map((l) => l.getId()),
            gauges: this.links
                .filter((l) => l.getLinkType() === GaugeNode.TYPE)
                .map((l) => l.getId()),
            lastCompletedComputations: this.links
                .filter((l) => l.getLinkType() === RainComputation.TYPE)
                .map((l) => l.getId()),
        };
    }

    public addRadars(linksToAdd: string[] | Link[] | RadarNode[]): void {
        this.addLinks(this._getRadarLinks(linksToAdd));
        this.setDefaultLatLng(linksToAdd);
    }

    public addCompletedComputations(linksToAdd: string[] | Link[] | RainComputation[]): void {
        this.addLinks(RainNode._getRainComputationLinks(linksToAdd));
    }

    public addGauges(linksToAdd: string[] | Link[] | GaugeNode[]): void {
        this.addLinks(RainNode._getGaugeLinks(linksToAdd));
    }

    public getCenter(): LatLng {
        let center = new LatLng({lat: 0, lng: 0});

        this.setDefaultLatLng(this['radars'], center);

        if (this.latLngRectsAsJSON && this.latLngRectsAsJSON !== '[]') {
            const rects = JSON.parse(this.latLngRectsAsJSON);
            center = CartesianTools.GetLatLngRectsCenter(rects);
        }

        return center;
    }

    public getLimitPoints(): [LatLng, LatLng] {
        let limitPoints: [LatLng, LatLng];

        this.setDefaultLatLng(this['radars'], this.getCenter());

        if (this.latLngRectsAsJSON && this.latLngRectsAsJSON !== '[]') {
            const rects = JSON.parse(this.latLngRectsAsJSON);
            limitPoints = CartesianTools.GetLimitPoints(rects);
        }

        return limitPoints;
    }

    protected getLinkType(): RaainNodeType {
        return RainNode.TYPE;
    }

    private _getRadarLinks(linksToPurify: any[]): any[] {
        if (!linksToPurify || linksToPurify.length === 0) {
            return [];
        }

        const linksPurified = linksToPurify.map((l) => {
            if (l instanceof Link) {
                return l;
            } else if (l && l['_id']) {
                return new RadarNode({
                    id: l['_id'].toString(),
                    latitude: l.latitude,
                    longitude: l.latitude,
                    name: l.name,
                    team: l.team,
                });
            } else if (l && l.id) {
                return new RadarNode({
                    id: l.id.toString(),
                    latitude: l.latitude,
                    longitude: l.longitude,
                    name: l.name,
                    team: l.team,
                });
            } else if (typeof l === 'string') {
                return new RadarNode({id: l, latitude: 0, longitude: 0, name: '', team: this.team});
            }
        });

        return linksPurified.filter((l) => !!l);
    }

    private setDefaultLatLng(radars: string[] | Link[] | RadarNode[], center?: LatLng) {
        if (this.latLngRectsAsJSON && this.latLngRectsAsJSON !== '[]') {
            return;
        }

        const latLngRects: [LatLng, LatLng][] = [];
        if (radars?.length) {
            for (const radarNode of radars) {
                if (radarNode instanceof RadarNode) {
                    latLngRects.push([
                        new LatLng({lat: radarNode.latitude - 1, lng: radarNode.longitude - 1}),
                        new LatLng({lat: radarNode.latitude + 1, lng: radarNode.longitude + 1}),
                    ]);
                }
            }

            this.latLngRectsAsJSON = JSON.stringify(latLngRects);
        } else if (center) {
            latLngRects.push([
                new LatLng({
                    lat: center.lat + 1,
                    lng: center.lat - 1,
                }),
                new LatLng({
                    lat: center.lat - 1,
                    lng: center.lat + 1,
                }),
            ]);
        }

        if (latLngRects.length) {
            this.latLngRectsAsJSON = JSON.stringify(latLngRects);
        }
    }
}
