import {CartesianValue} from './CartesianValue';

export interface ICartesianMeasureValue {

    getCartesianValuesStringified(): string;

    getCartesianValues(): CartesianValue[];

    setCartesianValues(cartesianValues: CartesianValue[]): void;

    setCartesianValuesAsString(s: string): void;

    toJSON(): JSON;

    toJSONWithCartesianValuesStringified(): JSON;

    getCartesianValue(lat: number, lng: number): CartesianValue;

    getCartesianValueRounded(lat: number, lng: number, scale?: number): CartesianValue;

    setCartesianValue(lat: number, lng: number, value: number): void;

    getCartesianPixelWidth(): { lat: number, lng: number };

    setCartesianPixelWidth(lat: number, lng: number): void;
}
