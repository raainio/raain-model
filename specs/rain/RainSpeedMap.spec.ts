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
        const map = new RainSpeedMap({rainSpeeds: speeds, date});
        expect(map.rainSpeeds.length).eq(2);
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
        const map = new RainSpeedMap({rainSpeeds: [rs1, rs2]});

        // All three point shapes fall inside both areas; the first matching RainSpeed should be returned
        expect(map.getRainSpeed(new LatLng({lat: 0, lng: 0})).speedInMetersPerSec).to.equal(
            rs1.speedInMetersPerSec
        );
        expect(map.getRainSpeed({lat: 0, lng: 0} as any).speedInMetersPerSec).to.equal(
            rs1.speedInMetersPerSec
        );
        expect(map.getRainSpeed({latitude: 0, longitude: 0} as any).speedInMetersPerSec).to.equal(
            rs1.speedInMetersPerSec
        );

        // Inclusive boundary check (point on the edge)
        expect(map.getRainSpeed(new LatLng({lat: 1, lng: 1})).speedInMetersPerSec).to.equal(
            rs1.speedInMetersPerSec
        );
    });

    it('transpose: inside exactly one area moves point east along azimuth', () => {
        const area = [new LatLng({lat: -1, lng: -1}), new LatLng({lat: 1, lng: 1})] as [
            LatLng,
            LatLng,
        ];
        const rs = new RainSpeed({azimuthInDegrees: 90, speedInMetersPerSec: 10, latLngs: [area]});
        const map = new RainSpeedMap({rainSpeeds: [rs]});

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
        const map = new RainSpeedMap({rainSpeeds: [rs]});

        const start = new CartesianValue({value: 1, lat: 0, lng: 0});
        const minutes = 30; // 18,000 m ≈ 0.162° latitude
        const out = map.transpose(start, minutes);

        approx(out.lat, 18000 / 111195, 0.02);
        approx(out.lng, 0, 0.02);
    });

    it('transpose: finds closest RainSpeed even when point is outside all areas', () => {
        const farArea = [new LatLng({lat: 10, lng: 10}), new LatLng({lat: 11, lng: 11})] as [
            LatLng,
            LatLng,
        ];
        const rs = new RainSpeed({
            azimuthInDegrees: 45,
            speedInMetersPerSec: 20,
            latLngs: [farArea],
        });
        const map = new RainSpeedMap({rainSpeeds: [rs]});

        const start = new CartesianValue({value: 7, lat: 0, lng: 0});
        const out = map.transpose(start, 15);

        // Should use the only available RainSpeed (even though point is outside its area)
        // Moving northeast (45°) for 15 minutes at 20 m/s = 18,000 m
        const distance = 20 * 15 * 60; // 18,000 m
        const latChange = (distance * Math.cos((45 * Math.PI) / 180)) / 111195;
        const lngChange = (distance * Math.sin((45 * Math.PI) / 180)) / 111319;

        approx(out.lat, latChange, 0.02);
        approx(out.lng, lngChange, 0.02);
        expect(out.value).eq(7);
    });

    it('transpose: unchanged when distance is zero (zero minutes or speed)', () => {
        const area = [new LatLng({lat: -1, lng: -1}), new LatLng({lat: 1, lng: 1})] as [
            LatLng,
            LatLng,
        ];
        const rs = new RainSpeed({azimuthInDegrees: 45, speedInMetersPerSec: 0, latLngs: [area]});
        const map = new RainSpeedMap({rainSpeeds: [rs]});

        const start = new CartesianValue({value: 9, lat: 0.2, lng: -0.1});
        const out1 = map.transpose(start, 15); // speed 0
        expect(out1.lat).eq(0.2);
        expect(out1.lng).eq(-0.1);

        const rs2 = new RainSpeed({azimuthInDegrees: 45, speedInMetersPerSec: 10, latLngs: [area]});
        const map2 = new RainSpeedMap({rainSpeeds: [rs2]});
        const out2 = map2.transpose(start, 0); // minutes 0
        expect(out2.lat).eq(0.2);
        expect(out2.lng).eq(-0.1);
    });

    describe('transpose with strictContaining option', () => {
        it('strictContaining=true: uses first matching area that contains the point', () => {
            const area1 = [new LatLng({lat: -1, lng: -1}), new LatLng({lat: 1, lng: 1})] as [
                LatLng,
                LatLng,
            ];
            const area2 = [new LatLng({lat: -2, lng: -2}), new LatLng({lat: 2, lng: 2})] as [
                LatLng,
                LatLng,
            ];

            const rs1 = new RainSpeed({
                azimuthInDegrees: 90,
                speedInMetersPerSec: 10,
                latLngs: [area1],
            });
            const rs2 = new RainSpeed({
                azimuthInDegrees: 180,
                speedInMetersPerSec: 20,
                latLngs: [area2],
            });
            const map = new RainSpeedMap({rainSpeeds: [rs1, rs2]});

            // Point inside both areas - should use rs1 (first match)
            const start = new CartesianValue({value: 5, lat: 0, lng: 0});
            const out = map.transpose(start, 60, {strictContaining: true});

            // Should move east (azimuth 90) with speed 10 m/s for 60 minutes
            approx(out.lat, 0, 0.01);
            approx(out.lng, 36000 / 111319, 0.02);
        });

        it('strictContaining=true: returns undefined when point is outside all areas', () => {
            const area1 = [new LatLng({lat: 10, lng: 10}), new LatLng({lat: 11, lng: 11})] as [
                LatLng,
                LatLng,
            ];
            const rs1 = new RainSpeed({
                azimuthInDegrees: 90,
                speedInMetersPerSec: 10,
                latLngs: [area1],
            });
            const map = new RainSpeedMap({rainSpeeds: [rs1]});

            // Point outside all areas
            const start = new CartesianValue({value: 5, lat: 0, lng: 0});
            const out = map.transpose(start, 60, {strictContaining: true});

            // Should remain unchanged (no matching area)
            expect(out.lat).eq(0);
            expect(out.lng).eq(0);
            expect(out.value).eq(5);
        });

        it('strictContaining=false: finds closest RainSpeed by distance to center', () => {
            // Three areas at different distances from test point
            const area1 = [new LatLng({lat: 10, lng: 10}), new LatLng({lat: 11, lng: 11})] as [
                LatLng,
                LatLng,
            ]; // center: (10.5, 10.5)
            const area2 = [new LatLng({lat: 5, lng: 5}), new LatLng({lat: 6, lng: 6})] as [
                LatLng,
                LatLng,
            ]; // center: (5.5, 5.5)
            const area3 = [new LatLng({lat: 1, lng: 1}), new LatLng({lat: 2, lng: 2})] as [
                LatLng,
                LatLng,
            ]; // center: (1.5, 1.5) - CLOSEST to (0,0)

            const rs1 = new RainSpeed({
                azimuthInDegrees: 0,
                speedInMetersPerSec: 10,
                latLngs: [area1],
            });
            const rs2 = new RainSpeed({
                azimuthInDegrees: 90,
                speedInMetersPerSec: 20,
                latLngs: [area2],
            });
            const rs3 = new RainSpeed({
                azimuthInDegrees: 180,
                speedInMetersPerSec: 30,
                latLngs: [area3],
            });
            const map = new RainSpeedMap({rainSpeeds: [rs1, rs2, rs3]});

            // Test point at origin - closest to rs3
            const start = new CartesianValue({value: 5, lat: 0, lng: 0});
            const out = map.transpose(start, 60, {strictContaining: false});

            // Should use rs3 (azimuth 180, speed 30 m/s)
            // Moving south (180°) for 60 minutes at 30 m/s = 108,000 m
            approx(out.lat, -108000 / 111195, 0.02);
            approx(out.lng, 0, 0.02);
        });

        it('strictContaining=false: selects closest even when point is inside one area', () => {
            // Point at (0,0)
            // Area1 contains (0,0) but center is far: (-10,-10) to (10,10), center at (0,0)
            // Area2 doesn't contain (0,0) but center is closer: (0.5,0.5) to (1,1), center at (0.75,0.75)
            const area1 = [new LatLng({lat: -10, lng: -10}), new LatLng({lat: 10, lng: 10})] as [
                LatLng,
                LatLng,
            ]; // center: (0, 0)
            const area2 = [new LatLng({lat: 0.5, lng: 0.5}), new LatLng({lat: 1, lng: 1})] as [
                LatLng,
                LatLng,
            ]; // center: (0.75, 0.75) - farther

            const rs1 = new RainSpeed({
                azimuthInDegrees: 0,
                speedInMetersPerSec: 10,
                latLngs: [area1],
            });
            const rs2 = new RainSpeed({
                azimuthInDegrees: 90,
                speedInMetersPerSec: 20,
                latLngs: [area2],
            });
            const map = new RainSpeedMap({rainSpeeds: [rs1, rs2]});

            const start = new CartesianValue({value: 5, lat: 0, lng: 0});
            const out = map.transpose(start, 60, {strictContaining: false});

            // Should use rs1 (center at 0,0 is closer than 0.75,0.75)
            // Moving north (0°) for 60 minutes at 10 m/s = 36,000 m
            approx(out.lat, 36000 / 111195, 0.02);
            approx(out.lng, 0, 0.02);
        });

        it('strictContaining=false: handles single RainSpeed correctly', () => {
            const area = [new LatLng({lat: 5, lng: 5}), new LatLng({lat: 6, lng: 6})] as [
                LatLng,
                LatLng,
            ];
            const rs = new RainSpeed({
                azimuthInDegrees: 45,
                speedInMetersPerSec: 15,
                latLngs: [area],
            });
            const map = new RainSpeedMap({rainSpeeds: [rs]});

            const start = new CartesianValue({value: 5, lat: 0, lng: 0});
            const out = map.transpose(start, 60, {strictContaining: false});

            // Should use the only available RainSpeed
            // Moving northeast (45°) for 60 minutes at 15 m/s
            const distance = 15 * 60 * 60; // 54,000 m
            const latChange = (distance * Math.cos((45 * Math.PI) / 180)) / 111195;
            const lngChange = (distance * Math.sin((45 * Math.PI) / 180)) / 111319;

            approx(out.lat, latChange, 0.02);
            approx(out.lng, lngChange, 0.02);
        });

        it('strictContaining default (undefined): behaves as false (finds closest)', () => {
            const area1 = [new LatLng({lat: 10, lng: 10}), new LatLng({lat: 11, lng: 11})] as [
                LatLng,
                LatLng,
            ];
            const area2 = [new LatLng({lat: 1, lng: 1}), new LatLng({lat: 2, lng: 2})] as [
                LatLng,
                LatLng,
            ]; // CLOSEST

            const rs1 = new RainSpeed({
                azimuthInDegrees: 0,
                speedInMetersPerSec: 10,
                latLngs: [area1],
            });
            const rs2 = new RainSpeed({
                azimuthInDegrees: 180,
                speedInMetersPerSec: 20,
                latLngs: [area2],
            });
            const map = new RainSpeedMap({rainSpeeds: [rs1, rs2]});

            const start = new CartesianValue({value: 5, lat: 0, lng: 0});
            const out = map.transpose(start, 60); // No options = default behavior

            // Should find closest (rs2)
            approx(out.lat, -72000 / 111195, 0.02); // Moving south
            approx(out.lng, 0, 0.02);
        });
    });
});
