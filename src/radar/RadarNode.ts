import {Link, RaainNode, TeamNode} from '../organization';

/**
 *  api/radars/:id
 */
export class RadarNode extends RaainNode {
    public static TYPE = 'radar';

    public name: string;
    public description: string;
    public technicalInfos: string;
    public latitude: number;
    public longitude: number;
    public team: TeamNode;
    public open: boolean;

    // internal
    private configurationAsJSON: string;

    constructor(json: {
        id: string;
        latitude: number;
        longitude: number;
        name: string;
        team: string | TeamNode;
        description?: string;
        technicalInfos?: string;
        open?: boolean;
        links?: Link[] | RaainNode[];
        version?: string;
        configurationAsJSON?: string;
    }) {
        super(json);
        this.latitude = json.latitude;
        this.longitude = json.longitude;
        this.name = json.name;
        this.description = json.description;
        this.technicalInfos = json.technicalInfos;
        this.team = json.team as TeamNode;
        if (typeof json.team === 'string') {
            this.team = new TeamNode({id: json.team});
        }
        this.open = !!json?.open;
        this.setConfiguration(json.configurationAsJSON);
    }

    public toJSON() {
        const json = super.toJSON();
        return {
            ...json,
            name: this.name,
            description: this.description,
            technicalInfos: this.technicalInfos,
            latitude: this.latitude,
            longitude: this.longitude,
            team: this.team?.id || this.team,
            configurationAsJSON: this.configurationAsJSON,
        };
    }

    public setConfiguration(configuration: string | any) {
        let conf = configuration;
        try {
            conf = JSON.parse(configuration);
        } catch (ignored) {
            // Ignore parsing errors, use the original value
        }

        if (conf) {
            this.configurationAsJSON = JSON.stringify(conf);
        }
    }

    public getConfiguration(): any {
        try {
            return JSON.parse(this.configurationAsJSON);
        } catch (e) {
            // Return null if configuration cannot be parsed
        }
        return null;
    }

    protected getLinkType(): string {
        return RadarNode.TYPE;
    }
}
