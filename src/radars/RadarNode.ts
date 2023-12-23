import {RaainNode} from '../organizations/RaainNode';
import {Link} from '../organizations/Link';

/**
 *  api/radars/:id
 */
export class RadarNode extends RaainNode {

    public static TYPE = 'radar';

    public name: string;
    public latitude: number;
    public longitude: number;

    constructor(
        idOrObjectToCopy: any | string,
        name?: string,
        links?: Link[] | RaainNode[],
        latitude?: number,
        longitude?: number,
        version?: string,
    ) {
        if (typeof (idOrObjectToCopy) !== 'string') {
            super(idOrObjectToCopy, idOrObjectToCopy.links, idOrObjectToCopy.version);

            this.name = idOrObjectToCopy.name;
            this.latitude = idOrObjectToCopy.latitude;
            this.longitude = idOrObjectToCopy.longitude;
            return;
        }

        super(idOrObjectToCopy, links, version);
        this.name = name;
        this.latitude = latitude;
        this.longitude = longitude;
    }

    public toJSON(): JSON {
        const json = super.toJSON();
        json['name'] = this.name;
        json['latitude'] = this.latitude;
        json['longitude'] = this.longitude;
        return json;
    }

    protected getLinkType(): string {
        return RadarNode.TYPE;
    }

}
