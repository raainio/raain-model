import {RaainNode} from '../organization/RaainNode';
import {Link} from '../organization/Link';
import {TeamNode} from '../organization/TeamNode';

/**
 *  api/gauges/:id
 */
export class GaugeNode extends RaainNode {

    public static TYPE = 'gauge';

    public name: string;
    public latitude: number;
    public longitude: number;
    public team: TeamNode;

    constructor(json: {
        id: string,
        latitude: number,
        longitude: number,
        name?: string,
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
        json['latitude'] = this.latitude;
        json['longitude'] = this.longitude;
        json['name'] = this.name;
        json['team'] = this.team?.id || this.team;
        return json;
    }

    protected getLinkType(): string {
        return GaugeNode.TYPE;
    }

}
