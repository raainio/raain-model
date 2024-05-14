export class MeasureConfiguration {

    public rainId: string;
    public type: string;
    public trust: boolean;

    constructor(json: {
        rainId: string;
        type: string;
        trust: boolean;
    }) {
        this.rainId = json.rainId;
        this.type = json.type;
        this.trust = json.trust;
    }

}
