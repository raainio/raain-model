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
}