export class MeasureValuePolarContainer {

    public azimuth: number;         // In degrees. 0° = North, 90°= Est, 180° = South, 270°= West.
    public distance: number;        // In meters. Edge distance.
    public polarEdges: number[];    // Edge Dbz values.

    constructor(json: {
        azimuth: number,
        distance: number,
        polarEdges: number[]
    }) {

        if (typeof json?.azimuth === 'undefined') {
            throw new Error('MeasureValuePolarContainer needs a valid Object');
        }

        this.azimuth = json.azimuth;
        this.distance = json.distance;
        this.polarEdges = json.polarEdges;
    }

    public toJSON(): any {
        return {
            azimuth: this.azimuth,
            distance: this.distance,
            polarEdges: this.polarEdges,
        } as any;
    }
}
