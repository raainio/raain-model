import {PeopleNode} from './PeopleNode';
import {RaainNode} from './RaainNode';

/**
 *  api/teams?name=customerTeam
 */
export class TeamNode extends RaainNode {

    public static TYPE = 'team';

    public id: any | string;
    public name: string;
    public description: string;
    public contracts: string[];
    public contacts: PeopleNode[];

    constructor(json: {
        id: any | string,
        name?: string,
        description?: string,
        contracts?: string[],
        contacts?: PeopleNode[]
    }) {
        super(json);

        this.id = json.id;
        this.name = json.name;
        this.description = json.description;
        this.contracts = json.contracts;
        this.contacts = json.contacts;
    }

    public toJSON(): JSON {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            contracts: this.contracts,
            contacts: this.contacts,
        } as any;
    }

    protected getLinkType(): string {
        return TeamNode.TYPE;
    }
}
