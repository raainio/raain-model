import {MeasureConfiguration} from './MeasureConfiguration';

export class GaugeMeasureConfiguration extends MeasureConfiguration {

    public gaugeId: string;
    public angle: number;
    public speed: number;

    constructor(json: {
        gaugeId: string;
        rainId: string;
        type: string;
        trust: boolean;
        angle: number;
        speed: number;
    }) {
        super(json);
        this.gaugeId = json.gaugeId;
        this.angle = json.angle;
        this.speed = json.speed;
    }

    static PushOrUpdateTo(configurations: GaugeMeasureConfiguration[],
                          gaugeMeasureConfiguration: GaugeMeasureConfiguration) {

        const same = configurations.filter(c =>
            c.rainId === gaugeMeasureConfiguration.rainId &&
            c.type === gaugeMeasureConfiguration.type
        );

        if (same.length === 1) {
            if (typeof gaugeMeasureConfiguration.trust !== 'undefined') {
                same[0].trust = gaugeMeasureConfiguration.trust;
            }
            if (typeof gaugeMeasureConfiguration.angle !== 'undefined') {
                same[0].angle = gaugeMeasureConfiguration.angle;
            }
            if (typeof gaugeMeasureConfiguration.speed !== 'undefined') {
                same[0].speed = gaugeMeasureConfiguration.speed;
            }
        } else {
            configurations.push(gaugeMeasureConfiguration);
        }
    }
}
