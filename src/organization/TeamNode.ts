import {PeopleNode} from './PeopleNode';
import {RaainNode} from './RaainNode';

export interface ITeamNode {
}


/**
 * Represents a team in the RAAIN system.
 * This class manages team members and their contracts.
 *
 * @remarks
 * Used in the API endpoint: api/teams?name=customerTeam
 *
 * @example
 * ```typescript
 * const teamNode = new TeamNode({
 *   id: 'team1',
 *   name: 'Customer Team',
 *   description: 'Main customer support team',
 *   contracts: ['basic', 'premium'],
 *   contacts: [peopleNode1, peopleNode2]
 * });
 * ```
 */
export class TeamNode extends RaainNode {

    public static readonly TYPE = 'team';

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

        this.name = json.name;
        this.description = json.description;
        this.contracts = json.contracts;
        this.contacts = json.contacts;
    }

    public toJSON() {
        const json = super.toJSON();
        return {
            ...json,
            name: this.name,
            description: this.description,
            contracts: this.contracts,
            contacts: this.contacts,
        };
    }

    /**
     * Returns the link type for team nodes.
     *
     * @returns The string 'team'
     */
    protected getLinkType(): string {
        return TeamNode.TYPE;
    }
}
