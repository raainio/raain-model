export class MeasureValuePolarContainer {
    public azimuth: number;
    public distance: number;
    public polarEdges: number[];

    constructor(
        azimuthOrObjectToCopy: any | number,
        distance?: number,
        polarEdges?: number[]
    ) {

        if (!azimuthOrObjectToCopy && azimuthOrObjectToCopy !== 0) {
            throw new Error('MeasureValuePolarContainer needs a valid Object or ID');
        }

        if (typeof (azimuthOrObjectToCopy.azimuth) !== 'undefined') {
            this.azimuth = azimuthOrObjectToCopy.azimuth;
            this.distance = azimuthOrObjectToCopy.distance;
            this.polarEdges = azimuthOrObjectToCopy.polarEdges;
            return;
        }
        this.azimuth = azimuthOrObjectToCopy;
        this.distance = distance;
        this.polarEdges = polarEdges;
    }

    public toJSON(): JSON {
        return {
            azimuth: this.azimuth,
            distance: this.distance,
            polarEdges: this.polarEdges,
        } as any;
    }
}
