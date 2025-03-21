import {PeopleNode} from './PeopleNode';
import {RaainNode} from './RaainNode';

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

    /** Type identifier for team nodes */
    public static TYPE = 'team';

    /** Unique identifier for the team */
    public id: any | string;

    /** Name of the team */
    public name: string;

    /** Description of the team */
    public description: string;

    /** Array of contract types associated with the team */
    public contracts: string[];

    /** Array of team members */
    public contacts: PeopleNode[];

    /**
     * Creates a new TeamNode instance.
     *
     * @param json - Configuration object
     * @param json.id - Unique identifier
     * @param json.name - Optional name of the team
     * @param json.description - Optional description
     * @param json.contracts - Optional array of contract types
     * @param json.contacts - Optional array of team members
     */
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

    /**
     * Converts the team node to a JSON object.
     *
     * @returns A JSON object containing the team's data
     */
    public toJSON(): any {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            contracts: this.contracts,
            contacts: this.contacts,
        } as any;
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
