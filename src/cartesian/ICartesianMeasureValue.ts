import {CartesianValue} from './CartesianValue';
import {LatLng} from './LatLng';

export interface ICartesianMeasureValue {
    getLimitPoints(): [LatLng, LatLng];

    getCartesianValuesStringified(): string;

    getCartesianValues(): CartesianValue[];

    toJSON(): any;

    toJSONWithCartesianValuesStringified(): any;

    getCartesianValue(json: {lat: number; lng: number}): CartesianValue;

    getCartesianValueRounded(json: {lat: number; lng: number; scale: LatLng}): CartesianValue;

    setCartesianValue(json: {lat: number; lng: number; value: number}): void;

    getMinMaxValues(): {min: number; max: number} | null;
}
