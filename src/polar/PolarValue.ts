export class PolarValue {
    public value: number;
    public polarAzimuthInDegrees: number;
    public polarDistanceInMeters: number;

    constructor(json: {
        value: number,
        polarAzimuthInDegrees: number,
        polarDistanceInMeters: number
    }) {
        this.value = json.value;
        this.polarAzimuthInDegrees = json.polarAzimuthInDegrees;
        this.polarDistanceInMeters = json.polarDistanceInMeters;
    }
}

