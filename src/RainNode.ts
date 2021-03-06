import {RaainNode} from './RaainNode';
import {Link} from "./Link";
import {RadarNode} from "./RadarNode";
import {RainComputationNode} from "./RainComputationNode";

/**
 * api/rains/:id
 */
export class RainNode extends RaainNode {

    public name: string;
    public status: number;
    public quality: number;
    public latitude: number;
    public longitude: number;
    public radius: number;

    constructor(
        idOrObjectToCopy: any | string,
        name?: string,
        links?: Link[] | any[],
        status?: number,
        quality?: number,
        latitude?: number,
        longitude?: number,
        radius?: number
    ) {
        super(idOrObjectToCopy, links);

        if (typeof(idOrObjectToCopy) === 'object') {
            this.name = idOrObjectToCopy.name;
            this.status = idOrObjectToCopy.status;
            this.quality = idOrObjectToCopy.quality;
            this.latitude = idOrObjectToCopy.latitude;
            this.longitude = idOrObjectToCopy.longitude;
            this.radius = idOrObjectToCopy.radius;
            this.addRadars(idOrObjectToCopy.links);
            this.addRadars(idOrObjectToCopy.radars);
            this.addCompletedComputations(idOrObjectToCopy.links);
            this.addCompletedComputations(idOrObjectToCopy.lastCompletedComputations);
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
    }

    public toJSON(): Object {
        let json = super.toJSON();
        json['name'] = this.name;
        json['status'] = this.status;
        json['quality'] = this.quality;
        json['latitude'] = this.latitude;
        json['longitude'] = this.longitude;
        json['radius'] = this.radius;
        return json;
    }

    protected getLinkType(): string {
        return 'rain';
    }

    public addRadars(linksToAdd: Link[] | any[]): void {
        this.addLinks(RainNode._getRadarLinks(linksToAdd));
    }

    public addCompletedComputations(linksToAdd: Link[] | any[]): void {
        this.addLinks(RainNode._getRainComputationLinks(linksToAdd));
    }

    private static _getRadarLinks(linksToPurify: any[]): any[] {
        if (!linksToPurify || linksToPurify.length === 0) {
            return [];
        }

        return linksToPurify.map(l => {
            if (l instanceof Link) {
                return l;
            } else if (l.id) {
                return new RadarNode(l.id.toString('hex'));
            }
        });
    }

    private static _getRainComputationLinks(linksToPurify: any[]): any[] {
        if (!linksToPurify || linksToPurify.length === 0) {
            return [];
        }

        return linksToPurify.map(l => {
            if (l instanceof Link) {
                return l;
            } else if (l.id) {
                return new RainComputationNode(l.id.toString('hex'));
            }
        });
    }
}

