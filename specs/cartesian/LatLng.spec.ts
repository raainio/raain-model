import {expect} from 'chai';
import {CartesianTools, LatLng} from '../../src';

describe('LatLng', () => {
    it('should construct from {latitude, longitude} and be equal to {lat, lng}', () => {
        const a = new LatLng({latitude: 10.5, longitude: -20.25} as any);
        const b = new LatLng({lat: 10.5, lng: -20.25});
        expect(a.equals(b)).to.eq(true);
        expect(a.lat).to.eq(10.5);
        expect(a.lng).to.eq(-20.25);
        expect(a.toJSON()).to.deep.eq({lat: 10.5, lng: -20.25});
    });

    it('should throw when neither shape is provided', () => {
        expect(() => new LatLng({} as any)).to.throw('LatLng needs valid latitude && longitude');
    });

    it('should throw when values are not numeric', () => {
        expect(() => new LatLng({latitude: 'x' as any, longitude: 1 as any})).to.throw(
            'LatLng needs numeric latitude && longitude'
        );
        expect(() => new LatLng({lat: NaN as any, lng: 2 as any})).to.throw(
            'LatLng needs numeric latitude && longitude'
        );
    });
    it('rounded(scale) should round lat/lng to given step using CartesianTools with precision', () => {
        const p = new LatLng({lat: 12.1234, lng: -2.8000000000000003});
        const scale = new LatLng({lat: 0.01, lng: 0.1});
        p.rounded(scale);
        // Expect same behavior as CartesianTools.RoundLatLng with needPrecision=true
        expect(p.lat).to.eq(CartesianTools.RoundLatLng(12.1234, 0.01, true)); // 12.12
        expect(p.lat).to.eq(12.12);
        expect(p.lng).to.eq(CartesianTools.RoundLatLng(-2.8000000000000003, 0.1, true)); // -2.8
        expect(p.lng).to.eq(-2.8);

        // Try another scale with non-integer step (0.005)
        const p2 = new LatLng({lat: 12.1234, lng: 12.1234});
        const scale2 = new LatLng({lat: 0.005, lng: 0.001});
        p2.rounded(scale2);
        expect(p2.lat).to.eq(12.125);
        expect(p2.lng).to.eq(12.123);
    });

    it('limitPrecision(precision) should limit decimals to given precision', () => {
        // eslint-disable-next-line no-loss-of-precision
        const p = new LatLng({lat: 12.123456789012345, lng: -2.8000000000000003});
        p.limitPrecision(12);
        // Use the same underlying method expectations
        // eslint-disable-next-line no-loss-of-precision
        expect(p.lat).to.eq(CartesianTools.LimitWithPrecision(12.123456789012345, 12));
        expect(p.lat.toString().length).lessThanOrEqual(14); // ~ includes integer and dot
        expect(p.lng).to.eq(CartesianTools.LimitWithPrecision(-2.8000000000000003, 12));
        expect(p.lng).to.eq(-2.8);

        // Default precision
        // eslint-disable-next-line no-loss-of-precision
        const p2 = new LatLng({lat: 0.123456789123456789, lng: 179.99999999999997});
        p2.limitPrecision(); // default 12
        // eslint-disable-next-line no-loss-of-precision
        expect(p2.lat).to.eq(CartesianTools.LimitWithPrecision(0.123456789123456789, 12));
        expect(p2.lng).to.eq(CartesianTools.LimitWithPrecision(179.99999999999997, 12));
    });
});
