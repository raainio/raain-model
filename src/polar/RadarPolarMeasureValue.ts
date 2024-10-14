import {IPolarMeasureValue} from './IPolarMeasureValue';
import {AbstractPolarMeasureValue} from './AbstractPolarMeasureValue';
import {PolarMeasureValue} from './PolarMeasureValue';

/**
 * Radar with polar value containers
 */
export class RadarPolarMeasureValue extends AbstractPolarMeasureValue implements IPolarMeasureValue {

    public angle: number;   // In degrees. Radar incidence angle, from 0° to 90°, from the ground to the top
    public axis: number;    // In degrees. Polarization angle 0° = horizontal, 90°= vertical.

    constructor(json: {
        polarMeasureValue: RadarPolarMeasureValue | PolarMeasureValue | string,
        angle: number
        axis: number
    }) {
        super(json);

        if (json.polarMeasureValue instanceof RadarPolarMeasureValue) {
            this.angle = json.polarMeasureValue.angle;
            this.axis = json.polarMeasureValue.axis;
            return;
        }

        if (typeof json.polarMeasureValue === 'string') {
            const object = JSON.parse(json.polarMeasureValue);
            this.angle = typeof json.angle !== 'undefined' ? json.angle : object.angle;
            this.axis = typeof json.axis !== 'undefined' ? json.axis : object.axis;
            return;
        }

        this.angle = json.angle;
        this.axis = json.axis;
    }

    /**
     * A fake image to give an example of format needed, made of:
     *  - 2 axis: horizontal + vertical
     *  - 3 sites: 0.4°, 1.4° and 2.4°
     *  - 720 azimuth with a step of 0.5°
     *  - 250 gate with a step of 1KM
     */
    public static BuildFakeRadarPolarMeasureValues(movementFrom0To90 = 0): RadarPolarMeasureValue[] {
        const radarPolarMeasureValues: RadarPolarMeasureValue[] = [];

        const getMovementValue = (az: number, dis: number) => {
            const sin = Math.sin(az * (Math.PI / 180));
            const tolerance = 20;
            let val = 0;
            const absAz = Math.abs(az - movementFrom0To90);
            const absDis = Math.abs(dis - 100);
            if (absAz < tolerance && absDis < tolerance) {
                val = 56 - absAz * Math.random() * 2;
            }
            return val;
        };

        for (let axis = 0; axis <= 90; axis += 90) {    // 2 axis: horizontal + vertical
            for (let angle = 0.4; angle < 3; angle++) { // 3 sites: 0.4°, 1.4°, 2.4°
                const value = {
                    polarMeasureValue: null,
                    axis,
                    angle
                };
                const polars = [];
                for (let azimuth = 0; azimuth < 360; azimuth += 0.5) {  // 0.5° azimuth
                    const data = [];
                    for (let distance = 0; distance < 250; distance++) {
                        const num = Math.round(angle * getMovementValue(azimuth, distance));
                        data.push(num);
                    }
                    const polar = {
                        azimuth,
                        distance: 1000, // 1KM gate = 1000 meters
                        polarEdges: data,
                    };
                    polars.push(polar);
                }
                value.polarMeasureValue = polars;
                const radarPolarMeasureValue = new RadarPolarMeasureValue(value);
                radarPolarMeasureValues.push(radarPolarMeasureValue);
            }
        }
        return radarPolarMeasureValues;
    }

    public toJSON(stringify = false): any {
        const json = super.toJSON(stringify);
        json.angle = this.angle;
        json.axis = this.axis;
        return json;
    }

    public toJSONWithPolarStringified(): any {
        const json = super.toJSONWithPolarStringified();
        json.angle = this.angle;
        json.axis = this.axis;
        return json;
    }
}
