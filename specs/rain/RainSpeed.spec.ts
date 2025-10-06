import * as chai from 'chai';
import {expect} from 'chai';
import * as chaiSpies from 'chai-spies';
import {CartesianTools, LatLng, RainSpeed} from '../../src';

chai.use(chaiSpies);

describe('RainSpeed', () => {
    it('should construct with basic fields', () => {
        const topLeft = new LatLng({lat: 0, lng: 0});
        const bottomRight = new LatLng({lat: 2, lng: 2});
        const latLngs: [LatLng, LatLng][] = [[topLeft, bottomRight]];
        const rs = new RainSpeed({
            azimuthInDegrees: 45,
            speedInMetersPerSec: 12.5,
            date: new Date(1700000000000),
            latLngs,
        });

        expect(rs.azimuthInDegrees).eq(45);
        expect(rs.speedInMetersPerSec).eq(12.5);
        expect(rs.date?.getTime()).eq(1700000000000);
        expect(rs.latLngs).deep.eq(latLngs);
        expect(JSON.stringify(rs.toJSON())).eq(
            '{"azimuthInDegrees":45,"speedInMetersPerSec":12.5,"trustRatio":-1,"date":"2023-11-14T22:13:20.000Z","latLngs":[[{"lat":0,"lng":0},{"lat":2,"lng":2}]]}'
        );
    });

    it('should default latLngs to empty array when undefined', () => {
        const rs = new RainSpeed({
            azimuthInDegrees: 0,
            speedInMetersPerSec: 0,
            date: undefined,
            latLngs: undefined,
        });
        expect(Array.isArray(rs.latLngs)).to.be.true;
        expect(rs.latLngs.length).eq(0);
    });

    it('should wrap a single LatLng into a [topLeft,bottomRight] pair', () => {
        const p = new LatLng({lat: 1.23, lng: 4.56});
        const rs = new RainSpeed({
            azimuthInDegrees: 10,
            speedInMetersPerSec: 1,
            latLngs: p,
        });
        expect(rs.latLngs.length).eq(1);
        expect(rs.latLngs[0][0].lat).eq(1.23);
        expect(rs.latLngs[0][0].lng).eq(4.56);
        expect(rs.latLngs[0][1].lat).eq(1.23);
        expect(rs.latLngs[0][1].lng).eq(4.56);
    });

    it('getCenter should delegate to CartesianTools.GetLatLngRectsCenter', () => {
        const topLeft = new LatLng({lat: 0, lng: 0});
        const bottomRight = new LatLng({lat: 2, lng: 2});
        const latLngs: [LatLng, LatLng][] = [[topLeft, bottomRight]];
        const rs = new RainSpeed({
            azimuthInDegrees: 0,
            speedInMetersPerSec: 0,
            latLngs,
        });

        const expectedCenter = new LatLng({lat: 1, lng: 1});

        const spy = (chai as any).spy.on(
            CartesianTools as any,
            'GetLatLngRectsCenter',
            () => expectedCenter
        );
        const center = rs.getCenter();
        expect(center).to.equal(expectedCenter);
        const spyMeta = (spy as any).__spy;
        expect(spyMeta.calls.length).eq(1);
        expect(spyMeta.calls[0][0]).to.equal(rs.latLngs);
        (chai as any).spy.restore(CartesianTools as any, 'GetLatLngRectsCenter');
    });
});
