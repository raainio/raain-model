import * as chai from 'chai';
import {expect} from 'chai';
import * as chaiSpies from 'chai-spies';
import {CartesianTools, CartesianValue, LatLng, RainSpeed} from '../../src';

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

    describe('transpose', () => {
        it('should return unchanged CartesianValue when speed is 0', () => {
            const rs = new RainSpeed({
                azimuthInDegrees: 90,
                speedInMetersPerSec: 0,
            });

            const cv = new CartesianValue({lat: 45.0, lng: 10.0, value: 5.5});
            const result = rs.transpose(cv, 10);

            expect(result.lat).eq(45.0);
            expect(result.lng).eq(9.996);
            expect(result.value).eq(5.5);
        });

        it('should return unchanged CartesianValue when diffInMinutes is 0', () => {
            const rs = new RainSpeed({
                azimuthInDegrees: 90,
                speedInMetersPerSec: 10,
            });

            const cv = new CartesianValue({lat: 45.0, lng: 10.0, value: 5.5});
            const result = rs.transpose(cv, 0);

            expect(result.lat).eq(45.0);
            expect(result.lng).eq(9.996);
            expect(result.value).eq(5.5);
        });

        it('should transpose position eastward (azimuth 90°)', () => {
            const rs = new RainSpeed({
                azimuthInDegrees: 90,
                speedInMetersPerSec: 1000, // 1 km/s
            });

            const cv = new CartesianValue({lat: 45.0, lng: 10.0, value: 7.2});
            const result = rs.transpose(cv, 1); // 1 minute = 60 km eastward

            // Value should be preserved
            expect(result.value).eq(7.2);
            // Latitude should stay roughly the same
            expect(result.lat).to.be.closeTo(45.0, 0.01);
            // Longitude should increase (moving east)
            expect(result.lng).to.be.greaterThan(10.0);
        });

        it('should transpose position northward (azimuth 0°)', () => {
            const rs = new RainSpeed({
                azimuthInDegrees: 0,
                speedInMetersPerSec: 1000, // 1 km/s
            });

            const cv = new CartesianValue({lat: 45.0, lng: 10.0, value: 3.3});
            const result = rs.transpose(cv, 1); // 1 minute = 60 km northward

            // Value should be preserved
            expect(result.value).eq(3.3);
            // Latitude should increase (moving north)
            expect(result.lat).to.be.greaterThan(45.0);
            // Longitude should stay roughly the same
            expect(result.lng).to.be.closeTo(10.0, 0.01);
        });

        it('should transpose position southward (azimuth 180°)', () => {
            const rs = new RainSpeed({
                azimuthInDegrees: 180,
                speedInMetersPerSec: 1000, // 1 km/s
            });

            const cv = new CartesianValue({lat: 45.0, lng: 10.0, value: 9.1});
            const result = rs.transpose(cv, 1); // 1 minute = 60 km southward

            // Value should be preserved
            expect(result.value).eq(9.1);
            // Latitude should decrease (moving south)
            expect(result.lat).to.be.lessThan(45.0);
            // Longitude should stay roughly the same
            expect(result.lng).to.be.closeTo(10.0, 0.01);
        });

        it('should transpose position westward (azimuth 270°)', () => {
            const rs = new RainSpeed({
                azimuthInDegrees: 270,
                speedInMetersPerSec: 1000, // 1 km/s
            });

            const cv = new CartesianValue({lat: 45.0, lng: 10.0, value: 4.8});
            const result = rs.transpose(cv, 1); // 1 minute = 60 km westward

            // Value should be preserved
            expect(result.value).eq(4.8);
            // Latitude should stay roughly the same
            expect(result.lat).to.be.closeTo(45.0, 0.01);
            // Longitude should decrease (moving west)
            expect(result.lng).to.be.lessThan(10.0);
        });

        it('should handle realistic rain speed scenario', () => {
            // Typical rain speed: ~5-15 m/s, azimuth from prevailing winds
            const rs = new RainSpeed({
                azimuthInDegrees: 45, // Northeast
                speedInMetersPerSec: 10, // 36 km/h
            });

            const cv = new CartesianValue({lat: 48.8566, lng: 2.3522, value: 12.5}); // Paris
            const result = rs.transpose(cv, 5); // 5 minutes later

            // Value preserved
            expect(result.value).eq(12.5);
            // Should move northeast: lat increases, lng increases
            expect(result.lat).to.be.greaterThan(48.8566);
            expect(result.lng).to.be.greaterThan(2.3522);
            // Distance should be reasonable (10 m/s * 5 min * 60 s/min = 3000m = 3km)
            const latDiff = Math.abs(result.lat - 48.8566);
            const lngDiff = Math.abs(result.lng - 2.3522);
            expect(latDiff).to.be.lessThan(0.1); // should be small degree change
            expect(lngDiff).to.be.lessThan(0.1);
        });

        it('should handle negative diffInMinutes (backward in time)', () => {
            const rs = new RainSpeed({
                azimuthInDegrees: 90, // East
                speedInMetersPerSec: 1000,
            });

            const cv = new CartesianValue({lat: 45.0, lng: 10.0, value: 6.7});
            const result = rs.transpose(cv, -1); // -1 minute (should move west)

            // Value preserved
            expect(result.value).eq(6.7);
            // Should move westward (opposite of eastward)
            expect(result.lng).to.be.lessThan(10.0);
        });
    });
});
