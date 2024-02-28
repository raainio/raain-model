export class MeasureValuePolarContainer {
    public azimuth: number;
    public distance: number;
    public polarEdges: number[];

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

    public toJSON(): JSON {
        return {
            azimuth: this.azimuth,
            distance: this.distance,
            polarEdges: this.polarEdges,
        } as any;
    }
}
