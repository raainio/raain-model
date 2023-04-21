import {PeopleNode} from './PeopleNode';

/**
 *  api/teams?name=customerTeam
 */
export class TeamNode {

    constructor(
        public id: any | string,
        public name?: string,
        public description?: string,
        public contracts?: string[],
        public contacts?: PeopleNode[]
    ) {
        if (typeof id === 'object') {
            this.id = id.id;
            this.name = id.name;
            this.description = id.description;
            this.contracts = id.contracts;
            this.contacts = id.contacts;
        }
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