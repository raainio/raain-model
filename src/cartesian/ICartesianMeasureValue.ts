import {CartesianValue} from './CartesianValue';
import {LatLng} from './LatLng';

export interface ICartesianMeasureValue {

    getCartesianValuesStringified(): string;

    getCartesianValues(): CartesianValue[];

    setCartesianValues(cartesianValues: CartesianValue[]): void;

    setCartesianValuesAsString(s: string): void;

    toJSON(): any;

    toJSONWithCartesianValuesStringified(): any;

    getCartesianValue(json: { lat: number, lng: number }): CartesianValue;

    getCartesianValueRounded(json: { lat: number, lng: number, scale?: number }): CartesianValue;

    setCartesianValue(json: { lat: number, lng: number, value: number }): void;

    getCartesianPixelWidth(): LatLng;

    setCartesianPixelWidth(json: { lat: number, lng: number }): void;
}
