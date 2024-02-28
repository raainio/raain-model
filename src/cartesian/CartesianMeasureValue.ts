import {ICartesianMeasureValue} from './ICartesianMeasureValue';
import {CartesianValue} from './CartesianValue';
import {LatLng} from './LatLng';

export class CartesianMeasureValue implements ICartesianMeasureValue {

    protected cartesianValues: CartesianValue[];
    protected cartesianPixelWidth: LatLng;

    constructor(json: {
                    cartesianValues: string | CartesianValue[],
                    cartesianPixelWidth: { lat: number, lng: number } | LatLng,
                }
    ) {

        if (!json?.cartesianValues || !json?.cartesianPixelWidth) {
            throw new Error('CartesianMeasureValue needs cartesianValues && cartesianPixelWidth');
        }

        this.setCartesianValuesAsAny(json.cartesianValues);
        this.setCartesianPixelWidth(json.cartesianPixelWidth);

    }

    static From(obj: any): CartesianMeasureValue {
        const created = new CartesianMeasureValue({
            cartesianValues: [],
            cartesianPixelWidth: {lat: 0, lng: 0}
        });

        if (typeof obj.cartesianValues !== 'undefined') {
            created.setCartesianValuesAsAny(obj.cartesianValues);
        }

        if (typeof obj.cartesianPixelWidth !== 'undefined' &&
            typeof obj.cartesianPixelWidth.lat !== 'undefined' &&
            typeof obj.cartesianPixelWidth.lng !== 'undefined') {
            created.setCartesianPixelWidth(obj.cartesianPixelWidth);
        }

        return created;
    }

    getCartesianValuesStringified(): string {
        return JSON.stringify({cartesianValues: this.cartesianValues});
    }

    getCartesianValues(): CartesianValue[] {
        return this.cartesianValues;
    }

    setCartesianValues(cartesianValues: CartesianValue[]): void {
        this.cartesianValues = cartesianValues;
    }

    setCartesianValuesAsString(s: string): void {
        let values = JSON.parse(s);
        if (values.cartesianValues) {
            values = values.cartesianValues;
        }

        if (Array.isArray(values)) {
            this.cartesianValues = [];
            values.forEach(v => {
                this.cartesianValues.push(new CartesianValue(v));
            });
        }
    }

    toJSON(stringify = false): JSON {

        let cartesianValues: any = this.cartesianValues;
        if (stringify) {
            cartesianValues = JSON.stringify(this.cartesianValues)
        }

        const json: any = {
            cartesianValues,
            cartesianPixelWidth: this.cartesianPixelWidth,
        };
        return json;
    }

    toJSONWithCartesianValuesStringified(): JSON {
        return {
            cartesianValues: JSON.stringify(this.cartesianValues),
            cartesianPixelWidth: this.cartesianPixelWidth,
        } as any;
    }

    getCartesianValue(json: { lat: number, lng: number }): CartesianValue {
        for (const value of this.cartesianValues) {
            if (value.lat === json.lat && value.lng === json.lng) {
                return value;
            }
        }
        return null;
    }

    getCartesianValueRounded(json: {
        lat: number,
        lng: number,
        scale: number
    }): CartesianValue {
        for (const value of this.cartesianValues) {
            const latRounded1 = Math.round(json.lat / json.scale) * json.scale;
            const lngRounded1 = Math.round(json.lng / json.scale) * json.scale;
            const latRounded2 = Math.round(value.lat / json.scale) * json.scale;
            const lngRounded2 = Math.round(value.lng / json.scale) * json.scale;
            if (latRounded1 === latRounded2 && lngRounded1 === lngRounded2) {
                return value;
            }
        }
        return null;
    }

    setCartesianValue(json: { lat: number, lng: number, value: number }): void {
        this.cartesianValues.push(new CartesianValue(json));
    }

    getCartesianPixelWidth(): LatLng {
        return this.cartesianPixelWidth;
    }

    setCartesianPixelWidth(latLng: { lat: number, lng: number } | LatLng): void {
        this.cartesianPixelWidth = new LatLng(latLng);
    }

    protected setCartesianValuesAsAny(cartesianValues: any) {
        if (typeof cartesianValues === 'string') {
            this.setCartesianValuesAsString(cartesianValues);
        } else {
            this.setCartesianValues(cartesianValues);
        }
    }
}
