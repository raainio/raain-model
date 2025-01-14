export class MeasureValuePolarContainer {

    public azimuth: number;         // In degrees. 0° = North, 90°= Est, 180° = South, 270°= West.
    public distance: number;        // In meters. Edge distance.
    public polarEdges: number[];    // Edge Dbz values.
    public edgeOffset: number;      // Edge Offset. Count of edges before the edge values. polarEdges can start from this offset.

    constructor(json: {
        azimuth: number,
        distance: number,
        polarEdges: number[],
        edgeOffset?: number,
    }) {

        if (typeof json?.azimuth === 'undefined') {
            throw new Error('MeasureValuePolarContainer needs a valid Object');
        }

        this.azimuth = json.azimuth;
        this.distance = json.distance;
        this.polarEdges = json.polarEdges;
        this.edgeOffset = json.edgeOffset ? json.edgeOffset : 0;
    }

    public toJSON(): any {
        return {
            azimuth: this.azimuth,
            distance: this.distance,
            polarEdges: this.polarEdges,
            edgeOffset: this.edgeOffset,
        } as any;
    }

    getPolarEdgesCount() {
        return this.edgeOffset + this.polarEdges.length;
    }

    getNotNullValuesCount() {
        const edges = this.polarEdges.filter(e => !!e);
        return edges.length;
    }

    getFiltered(options = {nullValues: true}): MeasureValuePolarContainer {
        let polarEdges = this.polarEdges.map(e => 1 - 1 + e);
        let edgeOffset = this.edgeOffset + 1 - 1;

        if (options.nullValues) {
            const firstNonNullValue = polarEdges.findIndex(value => !!value);
            const lastNonNullValue = polarEdges.reduce((lastIndex, value, currentIndex) => {
                if (!!value) {
                    return currentIndex;
                }
                return lastIndex;
            }, -1);

            if (firstNonNullValue >= 0 && lastNonNullValue >= 0) {
                polarEdges = polarEdges.slice(firstNonNullValue, lastNonNullValue + 1);
                edgeOffset = edgeOffset + firstNonNullValue;
            } else {
                polarEdges = [];
            }

            if (polarEdges.length === 0) {
                edgeOffset = 0;
            }
        }

        return new MeasureValuePolarContainer({
            azimuth: this.azimuth,
            distance: this.distance,
            polarEdges,
            edgeOffset,
        });
    }

    getDistance() {
        return this.distance;
    }
}
