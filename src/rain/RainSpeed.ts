import {CartesianTools, LatLng} from '../cartesian';

/**
 *  api/rains/:rainId/computations/:rainHistoryId/speeds => RainSpeedMap.map => RainSpeed[]
 */
export class RainSpeed {
    public azimuthInDegrees: number;
    public speedInMetersPerSec: number;
    public trustRatio: number;
    public date?: Date;
    public latLngs: [LatLng, LatLng][];

    constructor(json: {
        azimuthInDegrees: number;
        speedInMetersPerSec: number;
        trustRatio?: number;
        date?: Date;
        latLngs?: [LatLng, LatLng][] | LatLng;
    }) {
        this.azimuthInDegrees = json.azimuthInDegrees;
        this.speedInMetersPerSec = json.speedInMetersPerSec;
        this.trustRatio = json.trustRatio ?? -1;
        if (json.date) {
            this.date = json.date;
        }
        this.setArea(json.latLngs);
    }

    public getCenter() {
        return CartesianTools.GetLatLngRectsCenter(this.latLngs);
    }

    public toJSON() {
        return {
            azimuthInDegrees: this.azimuthInDegrees,
            speedInMetersPerSec: this.speedInMetersPerSec,
            trustRatio: this.trustRatio,
            date: this.date,
            latLngs: this.latLngs,
        };
    }

    private setArea(latLngs: [LatLng, LatLng][] | LatLng) {
        let latLngsToSet = latLngs ?? [];
        if (latLngs instanceof LatLng) {
            latLngsToSet = [[latLngs, latLngs]];
        }
        this.latLngs = latLngsToSet as [LatLng, LatLng][];
    }
}
