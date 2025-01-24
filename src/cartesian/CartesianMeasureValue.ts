import {ICartesianMeasureValue} from './ICartesianMeasureValue';
import {CartesianValue} from './CartesianValue';
import {LatLng} from './LatLng';

export class CartesianMeasureValue implements ICartesianMeasureValue {

    protected cartesianValues: CartesianValue[];
    protected limitPoints: [LatLng, LatLng];

    constructor(json: {
                    cartesianValues: string | CartesianValue[],
                    limitPoints?: [LatLng, LatLng]
                }
    ) {

        if (!json?.cartesianValues) {
            throw new Error('CartesianMeasureValue needs cartesianValues');
        }

        this.setCartesianValuesAsAny(json.cartesianValues);
        if (json.limitPoints?.length === 2) {
            this.setLimitPoints(json.limitPoints[0], json.limitPoints[1]);
        }
    }

    static From(obj: ICartesianMeasureValue | any): CartesianMeasureValue {
        const created = new CartesianMeasureValue({
            cartesianValues: [],
        });

        if (typeof obj.cartesianValues !== 'undefined') {
            created.setCartesianValuesAsAny(obj.cartesianValues);
        }

        if (Array.isArray(obj.limitPoints) && obj.limitPoints.length === 2) {
            created.setLimitPoints(obj.limitPoints[0], obj.limitPoints[1]);
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

    toJSON(options = {stringify: false}): any {

        let cartesianValues: any = this.cartesianValues;
        if (options.stringify) {
            cartesianValues = JSON.stringify(this.cartesianValues)
        }

        return {
            cartesianValues,
            limitPoints: this.getLimitPoints(),
        };
    }

    toJSONWithCartesianValuesStringified(): any {
        return this.toJSON({stringify: true});
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
        scale: LatLng
    }): CartesianValue {
        for (const value of this.cartesianValues) {
            const latRounded1 = Math.round(json.lat / json.scale.lat) * json.scale.lat;
            const lngRounded1 = Math.round(json.lng / json.scale.lng) * json.scale.lng;
            const latRounded2 = Math.round(value.lat / json.scale.lat) * json.scale.lat;
            const lngRounded2 = Math.round(value.lng / json.scale.lng) * json.scale.lng;
            if (latRounded1 === latRounded2 && lngRounded1 === lngRounded2) {
                return value;
            }
        }
        return null;
    }

    setCartesianValue(json: { lat: number, lng: number, value: number }): void {
        this.cartesianValues.push(new CartesianValue(json));
    }

    getLimitPoints(options = {forceCompute: false}): [LatLng, LatLng] {
        if (options.forceCompute || !this.limitPoints || this.limitPoints.length !== 2) {
            this.computeLimits();
        }
        return this.limitPoints;
    }

    setLimitPoints(point1: LatLng, point2: LatLng) {
        this.limitPoints = [
            new LatLng({lat: point1.lat, lng: point1.lng}),
            new LatLng({lat: point2.lat, lng: point2.lng})
        ];
    }

    protected setCartesianValuesAsAny(cartesianValues: any) {
        if (typeof cartesianValues === 'string') {
            this.setCartesianValuesAsString(cartesianValues);
        } else {
            this.setCartesianValues(cartesianValues);
        }
    }

    protected computeLimits() {
        this.limitPoints = undefined;
        let p1Lat: number;
        let p1Lng: number;
        let p2Lat: number;
        let p2Lng: number;

        for (const cartesianValue of this.cartesianValues) {
            if (typeof p1Lat === 'undefined' || cartesianValue.lat < p1Lat) {
                p1Lat = cartesianValue.lat;
            }
            if (typeof p1Lng === 'undefined' || cartesianValue.lng < p1Lng) {
                p1Lng = cartesianValue.lng;
            }
            if (typeof p2Lat === 'undefined' || p2Lat < cartesianValue.lat) {
                p2Lat = cartesianValue.lat;
            }
            if (typeof p2Lng === 'undefined' || p2Lng < cartesianValue.lng) {
                p2Lng = cartesianValue.lng;
            }
        }

        if (typeof p1Lat !== 'undefined' && typeof p1Lng !== 'undefined' &&
            typeof p2Lat !== 'undefined' && typeof p2Lng !== 'undefined') {
            this.setLimitPoints(new LatLng({lat: p1Lat, lng: p1Lng}),
                new LatLng({lat: p2Lat, lng: p2Lng}));
        }
    }
}
