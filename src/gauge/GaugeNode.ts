import {RaainNode} from '../organization/RaainNode';
import {Link} from '../organization/Link';
import {TeamNode} from '../organization/TeamNode';

/**
 *  api/gauges/:id
 */
export class GaugeNode extends RaainNode {

    public static TYPE = 'gauge';

    public name: string;
    public description: string;
    public latitude: number;
    public longitude: number;
    public team: TeamNode;
    private configurationAsJSON: string;

    constructor(json: {
        id: string,
        latitude: number,
        longitude: number,
        name: string,
        team: TeamNode,
        description?: string,
        links?: Link[] | RaainNode[],
        version?: string,
        configurationAsJSON?: any,
    }) {
        super(json);
        this.latitude = json.latitude;
        this.longitude = json.longitude;
        this.name = json.name;
        this.description = json.description;
        this.team = json.team;
        this.setConfiguration(json.configurationAsJSON);
    }

    public setConfiguration(configuration: string | any) {
        let conf = configuration;
        try {
            conf = JSON.parse(configuration);
        } catch (ignored) {
        }

        this.configurationAsJSON = JSON.stringify(conf);
    }

    public getConfiguration(): any {
        try {
            return JSON.parse(this.configurationAsJSON);
        } catch (e) {
        }
        return null;
    }

    public toJSON(): any {
        const json = super.toJSON();
        json['name'] = this.name;
        json['description'] = this.description;
        json['latitude'] = this.latitude;
        json['longitude'] = this.longitude;
        json['team'] = this.team?.id || this.team;
        json['configurationAsJSON'] = this.configurationAsJSON;
        return json;
    }

    protected getLinkType(): string {
        return GaugeNode.TYPE;
    }

}
