import {ICartesianMeasureValue} from './ICartesianMeasureValue';
import {CartesianValue} from './CartesianValue';

export class CartesianMeasureValue implements ICartesianMeasureValue {
    private cartesianValues: CartesianValue[];

    constructor(
        cartesianValues?: string | CartesianValue[]
    ) {

        this.cartesianValues = [];
        if (typeof cartesianValues === 'string') {
            this.setCartesianValuesAsString(cartesianValues);
        } else {
            this.setCartesianValues(cartesianValues);
        }
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
                this.cartesianValues.push(new CartesianValue(v.value, v.lat, v.lng));
            });
        }
    }

    toJSON(): JSON {
        const json: any = {cartesianValues: this.cartesianValues};
        return json;
    }

    toJSONWithCartesianValuesStringified(): JSON {
        return {cartesianValues: JSON.stringify(this.cartesianValues)} as any;
    }

    getCartesianValue(lat: number, lng: number): CartesianValue {
        for (const value of this.cartesianValues) {
            if (value.lat === lat && value.lng === lng) {
                return value;
            }
        }
        return null;
    }

    getCartesianValueRounded(lat: number, lng: number, scale: number = 0.01): CartesianValue {
        for (const value of this.cartesianValues) {
            const latRounded1 = Math.round(lat / scale) * scale;
            const lngRounded1 = Math.round(lng / scale) * scale;
            const latRounded2 = Math.round(value.lat / scale) * scale;
            const lngRounded2 = Math.round(value.lng / scale) * scale;
            if (latRounded1 === latRounded2 && lngRounded1 === lngRounded2) {
                return value;
            }
        }
        return null;
    }

    setCartesianValue(lat: number, lng: number, value: number): void {
        this.cartesianValues.push(new CartesianValue(value, lat, lng));
    }
}
