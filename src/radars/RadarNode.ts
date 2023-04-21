import {RaainNode} from '../organizations/RaainNode';
import {Link} from '../organizations/Link';
import {TeamNode} from '../organizations/TeamNode';

/**
 *  api/radars/:id
 */
export class RadarNode extends RaainNode {

    public static TYPE = 'radar';

    public name: string;
    public latitude: number;
    public longitude: number;
    public team: TeamNode;

    constructor(
        idOrObjectToCopy: any | string,
        name?: string,
        links?: Link[] | RaainNode[],
        latitude?: number,
        longitude?: number,
        team?: TeamNode,
    ) {
        super(idOrObjectToCopy, links);
        if (typeof (idOrObjectToCopy) === 'object') {
            this.name = idOrObjectToCopy.name;
            this.latitude = idOrObjectToCopy.latitude;
            this.longitude = idOrObjectToCopy.longitude;
            this.team = idOrObjectToCopy.team;
            return;
        }
        this.name = name;
        this.latitude = latitude;
        this.longitude = longitude;
        this.team = team;
    }

    public toJSON(): JSON {
        const json = super.toJSON();
        json['name'] = this.name;
        json['latitude'] = this.latitude;
        json['longitude'] = this.longitude;
        json['team'] = this.team?.id;
        return json;
    }

    protected getLinkType(): string {
        return RadarNode.TYPE;
    }

}