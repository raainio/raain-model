import {MeasureConfiguration} from './MeasureConfiguration';

export class RadarMeasureConfiguration extends MeasureConfiguration {

    public radarId: string;
    public angle: number;
    public speed: number;

    constructor(json: {
        radarId: string;
        rainId: string;
        type: string;
        trust: boolean;
        angle: number;
        speed: number;
    }) {
        super(json);
        this.radarId = json.radarId;
        this.angle = json.angle;
        this.speed = json.speed;
    }
}
