import {RaainNode} from '../organization/RaainNode';
import {Link} from '../organization/Link';
import {TeamNode} from '../organization/TeamNode';

/**
 *  api/radars/:id
 */
export class RadarNode extends RaainNode {

    public static TYPE = 'radar';

    public name: string;
    public latitude: number;
    public longitude: number;
    public team: TeamNode;

    constructor(json: {
        id: string,
        latitude: number,
        longitude: number,
        name: string,
        links?: Link[] | RaainNode[],
        team?: TeamNode,
        version?: string,
    }) {
        super(json);
        this.latitude = json.latitude;
        this.longitude = json.longitude;
        this.name = json.name;
        this.team = json.team;
    }

    public toJSON(): JSON {
        const json = super.toJSON();
        json['name'] = this.name;
        json['latitude'] = this.latitude;
        json['longitude'] = this.longitude;
        json['team'] = this.team?.id || this.team;
        return json;
    }

    protected getLinkType(): string {
        return RadarNode.TYPE;
    }

}
