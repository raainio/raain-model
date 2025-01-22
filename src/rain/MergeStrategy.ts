import {LatLng} from '../cartesian';

export enum MergeStrategy {
    NONE = 'none',
    SUM = 'sum',
    AVERAGE = 'average',
    MAX = 'max',
}

export interface MergeLatLng {
    sum: number;
    max: number;
    count: number;
    latLng: LatLng;
}
