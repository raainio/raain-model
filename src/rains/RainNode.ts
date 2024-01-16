import {RaainNode} from '../organizations/RaainNode';
import {Link} from '../organizations/Link';
import {RadarNode} from '../radars/RadarNode';
import {RainComputation} from './RainComputation';
import {GaugeNode} from '../gauges/GaugeNode';

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
    public radius: number;

    constructor(
        idOrObjectToCopy: any | string,
        name?: string,
        links?: Link[] | RaainNode[],
        status?: number,
        quality?: number,
        latitude?: number,
        longitude?: number,
        radius?: number,
        version?: string,
    ) {
        super(idOrObjectToCopy, links, version);

        if (typeof (idOrObjectToCopy) === 'object') {
            this.name = idOrObjectToCopy.name;
            this.status = idOrObjectToCopy.status;
            this.quality = idOrObjectToCopy.quality;
            this.latitude = parseFloat(idOrObjectToCopy.latitude);
            this.longitude = parseFloat(idOrObjectToCopy.longitude);
            this.radius = idOrObjectToCopy.radius;
            this.addRadars(idOrObjectToCopy.links);
            this.addRadars(idOrObjectToCopy.radars);
            this.addCompletedComputations(idOrObjectToCopy.links);
            this.addCompletedComputations(idOrObjectToCopy.lastCompletedComputations);
            this.addGauges(idOrObjectToCopy.links);
            this.addGauges(idOrObjectToCopy.gauges);
            return;
        }
        this.name = name;
        this.status = status;
        this.quality = quality;
        this.latitude = latitude;
        this.longitude = longitude;
        this.radius = radius;
        this.addRadars(links);
        this.addCompletedComputations(links);
        this.addGauges(links);
    }

    private static _getRadarLinks(linksToPurify: any[]): any[] {
        if (!linksToPurify || linksToPurify.length === 0) {
            return [];
        }

        const linksPurified = linksToPurify.map(l => {
            if (l instanceof Link) {
                return l;
            } else if (l && l._id) {
                return new RadarNode(l._id.toString());
            } else if (l && l.id) {
                return new RadarNode(l.id.toString()); // 'hex'
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
            } else if (l && l._id) {
                return new RainComputation(l._id.toString());
            } else if (l && l.id) {
                return new RainComputation(l.id.toString()); // 'hex'
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
            } else if (l && l._id) {
                return new GaugeNode(l._id.toString());
            } else if (l && l.id) {
                return new GaugeNode(l.id.toString()); // 'hex'
            }
        });

        return linksPurified.filter(l => !!l);
    }

    public toJSON(): JSON {
        const json = super.toJSON();
        json['name'] = this.name;
        json['status'] = this.status;
        json['quality'] = this.quality;
        json['latitude'] = this.latitude;
        json['longitude'] = this.longitude;
        json['radius'] = this.radius;
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

    protected getLinkType(): string {
        return RainNode.TYPE;
    }
}

