import {RaainNode} from "./RaainNode";
import {Link} from "./Link";

/**
 *  api/gauges/:id
 */
export class GaugeNode extends RaainNode {

    public name: string;
    public latitude: number;
    public longitude: number;

    constructor(
        idOrObjectToCopy: string |  { id?: string, name?: string, links?: Link[], latitude?: number, longitude?: number },
        name?: string,
        links?: Link[] | RaainNode[],
        latitude?: number,
        longitude?: number
    ) {
        super(idOrObjectToCopy, links);
        if (typeof idOrObjectToCopy !== "string") {
            this.name = idOrObjectToCopy.name;
            this.latitude = idOrObjectToCopy.latitude;
            this.longitude = idOrObjectToCopy.longitude;
            return;
        }
        this.name = name;
        this.latitude = latitude;
        this.longitude = longitude;
    }

    public toJSON(): Object {
        let json = super.toJSON();
        json['name'] = this.name;
        json['latitude'] = this.latitude;
        json['longitude'] = this.longitude;
        return json;
    }

    protected getLinkType() : string {
        return 'gauge';
    }

}


