import {PeopleNode} from './PeopleNode';
import {RaainNode} from './RaainNode';

/**
 *  api/teams?name=customerTeam
 */
export class TeamNode extends RaainNode{

    constructor(
        public id: any | string,
        public name?: string,
        public description?: string,
        public contracts?: string[],
        public contacts?: PeopleNode[]
    ) {
        super(id);
        if (typeof id === 'object') {
            this.id = id.id;
            this.name = id.name;
            this.description = id.description;
            this.contracts = id.contracts;
            this.contacts = id.contacts;
        }
    }


    protected getLinkType(): string {
        return 'team';
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
}
