import {PeopleNode} from './PeopleNode';
import {RaainNode} from './RaainNode';
import {RaainNodeType} from './RaainNodeType';

/**
 * Represents a team in the RAAIN system.
 * This class manages team members and their contracts.
 *
 * @remarks
 * Used in the API endpoint: api/teams/:id
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
 *
 * @external
 *  - API: /teams
 *  - API: /teams/:teamId
 */
export class TeamNode extends RaainNode {
    public static readonly TYPE = RaainNodeType.TeamNode;

    public name: string;
    public description: string;
    public contracts: string[];
    public contacts: PeopleNode[];

    constructor(json: {
        id: string;
        name?: string;
        description?: string;
        contracts?: string[];
        contacts?: PeopleNode[];
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

    protected getLinkType(): RaainNodeType {
        return TeamNode.TYPE;
    }
}
