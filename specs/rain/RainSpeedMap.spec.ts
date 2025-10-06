import {expect} from 'chai';
import {CartesianValue, LatLng, RainSpeed, RainSpeedMap} from '../../src';

function approx(a: number, b: number, tol = 0.005) {
    expect(Math.abs(a - b)).lte(tol);
}

describe('RainSpeedMap', () => {
    it('should keep map and date as provided', () => {
        const speeds = [
            new RainSpeed({azimuthInDegrees: 0, speedInMetersPerSec: 1, latLngs: []}),
            new RainSpeed({
                azimuthInDegrees: 90,
                speedInMetersPerSec: 2,
                latLngs: [[new LatLng({lat: 0, lng: 0}), new LatLng({lat: 1, lng: 1})]],
            }),
        ];
        const date = new Date(1710000000000);
        const map = new RainSpeedMap({map: speeds, date});
        expect(map.map).to.equal(speeds);
        expect(map.map.length).eq(2);
        expect(map.date?.getTime()).eq(1710000000000);
    });

    it('should getRainSpeed: returns first containing area and supports multiple point shapes', () => {
        const area1 = [new LatLng({lat: -1, lng: -1}), new LatLng({lat: 1, lng: 1})] as [
            LatLng,
            LatLng,
        ];
        const area2 = [new LatLng({lat: -2, lng: -2}), new LatLng({lat: 2, lng: 2})] as [
            LatLng,
            LatLng,
        ];

        const rs1 = new RainSpeed({azimuthInDegrees: 0, speedInMetersPerSec: 1, latLngs: [area1]});
        const rs2 = new RainSpeed({azimuthInDegrees: 90, speedInMetersPerSec: 2, latLngs: [area2]});
        const map = new RainSpeedMap({map: [rs1, rs2]});

        // All three point shapes fall inside both areas; the first matching RainSpeed should be returned
        expect(map.getRainSpeed(new LatLng({lat: 0, lng: 0}))).to.equal(rs1);
        expect(map.getRainSpeed({lat: 0, lng: 0} as any)).to.equal(rs1);
        expect(map.getRainSpeed({latitude: 0, longitude: 0} as any)).to.equal(rs1);

        // Inclusive boundary check (point on the edge)
        expect(map.getRainSpeed(new LatLng({lat: 1, lng: 1}))).to.equal(rs1);
    });

    it('transpose: inside exactly one area moves point east along azimuth', () => {
        const area = [new LatLng({lat: -1, lng: -1}), new LatLng({lat: 1, lng: 1})] as [
            LatLng,
            LatLng,
        ];
        const rs = new RainSpeed({azimuthInDegrees: 90, speedInMetersPerSec: 10, latLngs: [area]});
        const map = new RainSpeedMap({map: [rs]});

        const start = new CartesianValue({value: 5, lat: 0, lng: 0});
        const minutes = 60; // 10 m/s * 3600 s = 36,000 m ≈ 0.323° longitude at equator
        const out = map.transpose(start, minutes);

        // latitude should remain near zero, longitude should increase ~0.323°
        approx(out.lat, 0, 0.01);
        approx(out.lng, 36000 / 111319, 0.02);
        expect(out.value).eq(5);
    });

    it('transpose: northward azimuth increases latitude as expected', () => {
        const area = [new LatLng({lat: -2, lng: -2}), new LatLng({lat: 2, lng: 2})] as [
            LatLng,
            LatLng,
        ];
        const rs = new RainSpeed({azimuthInDegrees: 0, speedInMetersPerSec: 10, latLngs: [area]});
        const map = new RainSpeedMap({map: [rs]});

        const start = new CartesianValue({value: 1, lat: 0, lng: 0});
        const minutes = 30; // 18,000 m ≈ 0.162° latitude
        const out = map.transpose(start, minutes);

        approx(out.lat, 18000 / 111195, 0.02);
        approx(out.lng, 0, 0.02);
    });

    it('transpose: unchanged when no matching area', () => {
        const farArea = [new LatLng({lat: 10, lng: 10}), new LatLng({lat: 11, lng: 11})] as [
            LatLng,
            LatLng,
        ];
        const rs = new RainSpeed({
            azimuthInDegrees: 45,
            speedInMetersPerSec: 20,
            latLngs: [farArea],
        });
        const map = new RainSpeedMap({map: [rs]});

        const start = new CartesianValue({value: 7, lat: 0, lng: 0});
        const out = map.transpose(start, 15);
        expect(out.lat).eq(0);
        expect(out.lng).eq(0);
        expect(out.value).eq(7);
    });

    it('transpose: unchanged when multiple matching areas (ambiguous)', () => {
        const area1 = [new LatLng({lat: -1, lng: -1}), new LatLng({lat: 1, lng: 1})] as [
            LatLng,
            LatLng,
        ];
        const area2 = [new LatLng({lat: -0.5, lng: -0.5}), new LatLng({lat: 0.5, lng: 0.5})] as [
            LatLng,
            LatLng,
        ];
        const rs1 = new RainSpeed({azimuthInDegrees: 0, speedInMetersPerSec: 5, latLngs: [area1]});
        const rs2 = new RainSpeed({azimuthInDegrees: 90, speedInMetersPerSec: 5, latLngs: [area2]});
        const map = new RainSpeedMap({map: [rs1, rs2]});

        const start = new CartesianValue({value: 3, lat: 0, lng: 0});
        const out = map.transpose(start, 10);
        expect(out.lat).eq(0);
        expect(out.lng).eq(0);
        expect(out.value).eq(3);
    });

    it('transpose: unchanged when distance is zero (zero minutes or speed)', () => {
        const area = [new LatLng({lat: -1, lng: -1}), new LatLng({lat: 1, lng: 1})] as [
            LatLng,
            LatLng,
        ];
        const rs = new RainSpeed({azimuthInDegrees: 45, speedInMetersPerSec: 0, latLngs: [area]});
        const map = new RainSpeedMap({map: [rs]});

        const start = new CartesianValue({value: 9, lat: 0.2, lng: -0.1});
        const out1 = map.transpose(start, 15); // speed 0
        expect(out1.lat).eq(0.2);
        expect(out1.lng).eq(-0.1);

        const rs2 = new RainSpeed({azimuthInDegrees: 45, speedInMetersPerSec: 10, latLngs: [area]});
        const map2 = new RainSpeedMap({map: [rs2]});
        const out2 = map2.transpose(start, 0); // minutes 0
        expect(out2.lat).eq(0.2);
        expect(out2.lng).eq(-0.1);
    });
});
