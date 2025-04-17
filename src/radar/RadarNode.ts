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

    // internal
    private configurationAsJSON: string;

    constructor(json: {
        id: string,
        latitude: number,
        longitude: number,
        name: string,
        team: TeamNode,
        description?: string,
        technicalInfos?: string,
        links?: Link[] | RaainNode[],
        version?: string,
        configurationAsJSON?: any,
    }) {
        super(json);
        this.latitude = json.latitude;
        this.longitude = json.longitude;
        this.name = json.name;
        this.description = json.description;
        this.technicalInfos = json.technicalInfos;
        this.team = json.team;
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
            configurationAsJSON: this.configurationAsJSON
        };
    }

    public setConfiguration(configuration: string | any) {
        let conf = configuration;
        try {
            conf = JSON.parse(configuration);
        } catch (ignored) {
        }

        if (conf) {
            this.configurationAsJSON = JSON.stringify(conf);
        }
    }

    public getConfiguration(): any {
        try {
            return JSON.parse(this.configurationAsJSON);
        } catch (e) {
        }
        return null;
    }

    protected getLinkType(): string {
        return RadarNode.TYPE;
    }

}
