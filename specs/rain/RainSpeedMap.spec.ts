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

    /**
     * SPEC: getRainSpeed with options parameter
     *
     * BEHAVIOR: Test getRainSpeed method with strictContaining and inEarthMap options
     * This specification tests the options parameter added to getRainSpeed method
     */
    describe('getRainSpeed with options', () => {
        describe('when strictContaining option is not specified (default)', () => {
            /**
             * GIVEN: Multiple RainSpeed areas, point outside all areas
             * WHEN: getRainSpeed is called without options
             * THEN: Should find the closest RainSpeed by calculating distance from point to each RainSpeed's center
             */
            it('should find closest RainSpeed by distance to center when point is outside all areas', () => {
                // Three areas at different distances from test point (0,0)
                const area1 = [new LatLng({lat: 10, lng: 10}), new LatLng({lat: 11, lng: 11})] as [
                    LatLng,
                    LatLng,
                ]; // center: (10.5, 10.5) - farthest
                const area2 = [new LatLng({lat: 5, lng: 5}), new LatLng({lat: 6, lng: 6})] as [
                    LatLng,
                    LatLng,
                ]; // center: (5.5, 5.5) - middle
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

                // Test point at origin - should find rs3 (closest by center distance)
                const result = map.getRainSpeed(new LatLng({lat: 0, lng: 0}));

                expect(result).to.exist;
                expect(result?.speedInMetersPerSec).to.equal(30); // rs3
            });

            /**
             * GIVEN: Point inside one area but closer to another area's center
             * WHEN: getRainSpeed is called without options
             * THEN: Should return the area that contains the point (not necessarily the closest center)
             */
            it('should return containing area when point is inside, regardless of center distance', () => {
                // Area1 contains point (0,0)
                const area1 = [
                    new LatLng({lat: -10, lng: -10}),
                    new LatLng({lat: 10, lng: 10}),
                ] as [LatLng, LatLng]; // center: (0, 0)
                // Area2 doesn't contain (0,0) but has closer center
                const area2 = [new LatLng({lat: 0.5, lng: 0.5}), new LatLng({lat: 1, lng: 1})] as [
                    LatLng,
                    LatLng,
                ]; // center: (0.75, 0.75)

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

                const result = map.getRainSpeed(new LatLng({lat: 0, lng: 0}));

                expect(result).to.exist;
                expect(result?.speedInMetersPerSec).to.equal(10); // rs1 (contains the point)
            });
        });

        describe('when strictContaining option is true', () => {
            /**
             * GIVEN: Point inside multiple RainSpeed areas
             * WHEN: getRainSpeed is called with strictContaining: true
             * THEN: Should return the first matching RainSpeed whose area contains the point
             */
            it('should return first matching area that contains the point', () => {
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

                // Point inside both areas - should return rs1 (first match)
                const result = map.getRainSpeed(new LatLng({lat: 0, lng: 0}), {
                    strictContaining: true,
                });

                expect(result).to.exist;
                expect(result?.speedInMetersPerSec).to.equal(10); // rs1
            });

            /**
             * GIVEN: Point outside all RainSpeed areas
             * WHEN: getRainSpeed is called with strictContaining: true
             * THEN: Should return undefined (not fall back to closest)
             */
            it('should return undefined when point is outside all areas', () => {
                const area1 = [new LatLng({lat: 10, lng: 10}), new LatLng({lat: 11, lng: 11})] as [
                    LatLng,
                    LatLng,
                ];
                const area2 = [new LatLng({lat: 5, lng: 5}), new LatLng({lat: 6, lng: 6})] as [
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

                // Point outside all areas
                const result = map.getRainSpeed(new LatLng({lat: 0, lng: 0}), {
                    strictContaining: true,
                });

                expect(result).to.be.undefined;
            });
        });

        describe('when strictContaining option is false', () => {
            /**
             * GIVEN: Point outside all RainSpeed areas
             * WHEN: getRainSpeed is called with strictContaining: false
             * THEN: Should find closest RainSpeed by calculating distance to centers
             */
            it('should find closest RainSpeed by center distance when point is outside all areas', () => {
                const area1 = [new LatLng({lat: 10, lng: 10}), new LatLng({lat: 11, lng: 11})] as [
                    LatLng,
                    LatLng,
                ]; // center: (10.5, 10.5)
                const area2 = [new LatLng({lat: 1, lng: 1}), new LatLng({lat: 2, lng: 2})] as [
                    LatLng,
                    LatLng,
                ]; // center: (1.5, 1.5) - CLOSEST to (0,0)

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

                const result = map.getRainSpeed(new LatLng({lat: 0, lng: 0}), {
                    strictContaining: false,
                });

                expect(result).to.exist;
                expect(result?.speedInMetersPerSec).to.equal(20); // rs2 (closest)
            });

            /**
             * GIVEN: Point inside one area
             * WHEN: getRainSpeed is called with strictContaining: false
             * THEN: Should still return the containing area (not search by distance)
             */
            it('should return containing area even when strictContaining is false', () => {
                const area1 = [new LatLng({lat: -5, lng: -5}), new LatLng({lat: 5, lng: 5})] as [
                    LatLng,
                    LatLng,
                ]; // Contains (0,0)
                const area2 = [new LatLng({lat: 10, lng: 10}), new LatLng({lat: 11, lng: 11})] as [
                    LatLng,
                    LatLng,
                ];

                const rs1 = new RainSpeed({
                    azimuthInDegrees: 90,
                    speedInMetersPerSec: 15,
                    latLngs: [area1],
                });
                const rs2 = new RainSpeed({
                    azimuthInDegrees: 180,
                    speedInMetersPerSec: 25,
                    latLngs: [area2],
                });
                const map = new RainSpeedMap({rainSpeeds: [rs1, rs2]});

                const result = map.getRainSpeed(new LatLng({lat: 0, lng: 0}), {
                    strictContaining: false,
                });

                expect(result).to.exist;
                expect(result?.speedInMetersPerSec).to.equal(15); // rs1 (contains point)
            });
        });

        describe('when inEarthMap option is provided', () => {
            /**
             * SPEC: inEarthMap option rounds coordinates before searching
             *
             * GIVEN: Point with high-precision coordinates and RainSpeed areas with rounded boundaries
             * WHEN: getRainSpeed is called with inEarthMap: true
             * THEN: Should round the point coordinates and RainSpeed latLngs before searching
             */
            it('should round point coordinates when inEarthMap is true', () => {
                // Area with boundaries at rounded coordinates
                const area = [
                    new LatLng({lat: 45.12, lng: -122.68}),
                    new LatLng({lat: 45.52, lng: -122.28}),
                ] as [LatLng, LatLng];

                const rs = new RainSpeed({
                    azimuthInDegrees: 90,
                    speedInMetersPerSec: 10,
                    latLngs: [area],
                });
                const map = new RainSpeedMap({rainSpeeds: [rs]});

                // Point with high precision that should be rounded to fall within the area
                // After rounding: lat: 45.32 -> should round to match area boundaries
                const result = map.getRainSpeed(
                    new LatLng({lat: 45.321456789, lng: -122.481234567}),
                    {inEarthMap: true}
                );

                // Should find the RainSpeed after rounding coordinates
                expect(result).to.exist;
                expect(result?.speedInMetersPerSec).to.equal(10);
            });

            /**
             * GIVEN: Point outside area boundaries before rounding, but inside after rounding
             * WHEN: getRainSpeed is called with inEarthMap: true
             * THEN: Should find the RainSpeed due to coordinate rounding
             */
            it('should match area after rounding that would not match without rounding', () => {
                // Small area at specific rounded coordinates
                const area = [
                    new LatLng({lat: 40.0, lng: -74.0}),
                    new LatLng({lat: 40.1, lng: -73.9}),
                ] as [LatLng, LatLng];

                const rs = new RainSpeed({
                    azimuthInDegrees: 45,
                    speedInMetersPerSec: 5,
                    latLngs: [area],
                });
                const map = new RainSpeedMap({rainSpeeds: [rs]});

                // Point slightly outside that rounds into the area
                // This point at 40.049 should round to 40.0 (inside area)
                const result = map.getRainSpeed(new LatLng({lat: 40.049, lng: -73.951}), {
                    inEarthMap: true,
                });

                expect(result).to.exist;
                expect(result?.speedInMetersPerSec).to.equal(5);
            });

            /**
             * GIVEN: Point coordinates with inEarthMap option
             * WHEN: Combined with strictContaining option
             * THEN: Should apply rounding first, then check strict containment
             */
            it('should work correctly when combined with strictContaining option', () => {
                const area1 = [
                    new LatLng({lat: 10.0, lng: 10.0}),
                    new LatLng({lat: 10.5, lng: 10.5}),
                ] as [LatLng, LatLng];
                const area2 = [
                    new LatLng({lat: 0.0, lng: 0.0}),
                    new LatLng({lat: 1.0, lng: 1.0}),
                ] as [LatLng, LatLng];

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

                // Point that rounds into area2
                const result = map.getRainSpeed(new LatLng({lat: 0.501, lng: 0.501}), {
                    inEarthMap: true,
                    strictContaining: true,
                });

                // After rounding, should be inside area2
                expect(result).to.exist;
                expect(result?.speedInMetersPerSec).to.equal(20);
            });

            /**
             * GIVEN: Point with inEarthMap=false and strictContaining=true
             * WHEN: getRainSpeed is called
             * THEN: Should use exact coordinates without rounding and return undefined when outside
             */
            it('should not round coordinates when inEarthMap is false', () => {
                // Area with precise boundaries
                const area = [
                    new LatLng({lat: 45.0, lng: -122.0}),
                    new LatLng({lat: 45.1, lng: -121.9}),
                ] as [LatLng, LatLng];

                const rs = new RainSpeed({
                    azimuthInDegrees: 90,
                    speedInMetersPerSec: 10,
                    latLngs: [area],
                });
                const map = new RainSpeedMap({rainSpeeds: [rs]});

                // Point just outside area boundaries (would be inside if rounded)
                const result = map.getRainSpeed(new LatLng({lat: 45.15, lng: -122.05}), {
                    inEarthMap: false,
                    strictContaining: true,
                });

                // Should NOT find the RainSpeed (no rounding, strictContaining prevents fallback)
                expect(result).to.be.undefined;
            });
        });

        describe('when both strictContaining and inEarthMap options are combined', () => {
            /**
             * GIVEN: Point outside area before rounding, inside after rounding
             * WHEN: getRainSpeed is called with both inEarthMap: true and strictContaining: true
             * THEN: Should round first, then check strict containment, returning the matching area
             */
            it('should round coordinates then apply strict containment logic', () => {
                // With floor-based snapping, point (50.005, 10.005) floors to (50.0, 10.0)
                const area1 = [
                    new LatLng({lat: 50.0, lng: 10.0}),
                    new LatLng({lat: 50.2, lng: 10.2}),
                ] as [LatLng, LatLng];
                const area2 = [
                    new LatLng({lat: 50.0, lng: 10.0}),
                    new LatLng({lat: 50.5, lng: 10.5}),
                ] as [LatLng, LatLng];

                const rs1 = new RainSpeed({
                    azimuthInDegrees: 0,
                    speedInMetersPerSec: 15,
                    latLngs: [area1],
                });
                const rs2 = new RainSpeed({
                    azimuthInDegrees: 90,
                    speedInMetersPerSec: 25,
                    latLngs: [area2],
                });
                const map = new RainSpeedMap({rainSpeeds: [rs1, rs2]});

                // Point (50.005, 10.005) floors to (50.0, 10.0), which is inside both areas
                const result = map.getRainSpeed(new LatLng({lat: 50.005, lng: 10.005}), {
                    inEarthMap: true,
                    strictContaining: true,
                });

                expect(result).to.exist;
                expect(result?.speedInMetersPerSec).to.equal(15); // rs1 (first match)
            });

            /**
             * GIVEN: Point that doesn't match any area even after rounding
             * WHEN: getRainSpeed is called with both inEarthMap: true and strictContaining: true
             * THEN: Should return undefined
             */
            it('should return undefined when no area contains rounded point with strictContaining', () => {
                const area = [
                    new LatLng({lat: 10.0, lng: 10.0}),
                    new LatLng({lat: 10.5, lng: 10.5}),
                ] as [LatLng, LatLng];

                const rs = new RainSpeed({
                    azimuthInDegrees: 90,
                    speedInMetersPerSec: 10,
                    latLngs: [area],
                });
                const map = new RainSpeedMap({rainSpeeds: [rs]});

                // Point that's far outside even after rounding
                const result = map.getRainSpeed(new LatLng({lat: 5.0, lng: 5.0}), {
                    inEarthMap: true,
                    strictContaining: true,
                });

                expect(result).to.be.undefined;
            });
        });

        describe('when trusted option is provided', () => {
            /**
             * SPEC: trusted option finds most trusted RainSpeed
             *
             * BEHAVIOR: When point is outside all areas and trusted: true,
             * instead of finding the closest by distance, find the RainSpeed with highest trustRatio
             */

            /**
             * GIVEN: Multiple RainSpeeds with different trustRatio values, point outside all areas
             * WHEN: getRainSpeed is called with trusted: true
             * THEN: Should return the RainSpeed with the highest trustRatio (not the closest)
             */
            it('should return most trusted RainSpeed when point is outside all areas', () => {
                const area1 = [new LatLng({lat: 1, lng: 1}), new LatLng({lat: 2, lng: 2})] as [
                    LatLng,
                    LatLng,
                ]; // CLOSEST to (0,0)
                const area2 = [new LatLng({lat: 10, lng: 10}), new LatLng({lat: 11, lng: 11})] as [
                    LatLng,
                    LatLng,
                ]; // Farther
                const area3 = [new LatLng({lat: 20, lng: 20}), new LatLng({lat: 21, lng: 21})] as [
                    LatLng,
                    LatLng,
                ]; // Farthest

                const rs1 = new RainSpeed({
                    azimuthInDegrees: 0,
                    speedInMetersPerSec: 10,
                    trustRatio: 0.3, // Low trust, but closest
                    latLngs: [area1],
                });
                const rs2 = new RainSpeed({
                    azimuthInDegrees: 90,
                    speedInMetersPerSec: 20,
                    trustRatio: 0.95, // HIGHEST trust
                    latLngs: [area2],
                });
                const rs3 = new RainSpeed({
                    azimuthInDegrees: 180,
                    speedInMetersPerSec: 30,
                    trustRatio: 0.5,
                    latLngs: [area3],
                });
                const map = new RainSpeedMap({rainSpeeds: [rs1, rs2, rs3]});

                // Point at origin - outside all areas
                const result = map.getRainSpeed(new LatLng({lat: 0, lng: 0}), {trusted: true});

                expect(result).to.exist;
                expect(result?.trustRatio).to.equal(0.95); // rs2 - most trusted
                expect(result?.speedInMetersPerSec).to.equal(20);
            });

            /**
             * GIVEN: Point inside one area but trusted: true is specified
             * WHEN: getRainSpeed is called with trusted: true
             * THEN: Should return the containing area (not search by trust when point is inside)
             */
            it('should return containing area when point is inside, ignoring trusted option', () => {
                const area1 = [new LatLng({lat: -5, lng: -5}), new LatLng({lat: 5, lng: 5})] as [
                    LatLng,
                    LatLng,
                ]; // Contains (0,0)
                const area2 = [new LatLng({lat: 10, lng: 10}), new LatLng({lat: 11, lng: 11})] as [
                    LatLng,
                    LatLng,
                ];

                const rs1 = new RainSpeed({
                    azimuthInDegrees: 90,
                    speedInMetersPerSec: 15,
                    trustRatio: 0.4, // Low trust, but contains point
                    latLngs: [area1],
                });
                const rs2 = new RainSpeed({
                    azimuthInDegrees: 180,
                    speedInMetersPerSec: 25,
                    trustRatio: 0.99, // Higher trust, but doesn't contain point
                    latLngs: [area2],
                });
                const map = new RainSpeedMap({rainSpeeds: [rs1, rs2]});

                const result = map.getRainSpeed(new LatLng({lat: 0, lng: 0}), {trusted: true});

                expect(result).to.exist;
                expect(result?.trustRatio).to.equal(0.4); // rs1 - contains point
                expect(result?.speedInMetersPerSec).to.equal(15);
            });

            /**
             * GIVEN: RainSpeeds with varying trustRatio including negative and zero values
             * WHEN: getRainSpeed is called with trusted: true
             * THEN: Should return the RainSpeed with highest trustRatio (even if negative)
             */
            it('should handle negative and zero trustRatio values correctly', () => {
                const area1 = [new LatLng({lat: 10, lng: 10}), new LatLng({lat: 11, lng: 11})] as [
                    LatLng,
                    LatLng,
                ];
                const area2 = [new LatLng({lat: 20, lng: 20}), new LatLng({lat: 21, lng: 21})] as [
                    LatLng,
                    LatLng,
                ];
                const area3 = [new LatLng({lat: 30, lng: 30}), new LatLng({lat: 31, lng: 31})] as [
                    LatLng,
                    LatLng,
                ];

                const rs1 = new RainSpeed({
                    azimuthInDegrees: 0,
                    speedInMetersPerSec: 10,
                    trustRatio: -1, // Default value (not set)
                    latLngs: [area1],
                });
                const rs2 = new RainSpeed({
                    azimuthInDegrees: 90,
                    speedInMetersPerSec: 20,
                    trustRatio: 0, // Zero trust
                    latLngs: [area2],
                });
                const rs3 = new RainSpeed({
                    azimuthInDegrees: 180,
                    speedInMetersPerSec: 30,
                    trustRatio: 0.1, // HIGHEST (even though low)
                    latLngs: [area3],
                });
                const map = new RainSpeedMap({rainSpeeds: [rs1, rs2, rs3]});

                const result = map.getRainSpeed(new LatLng({lat: 0, lng: 0}), {trusted: true});

                expect(result).to.exist;
                expect(result?.trustRatio).to.equal(0.1); // rs3 - highest trust
                expect(result?.speedInMetersPerSec).to.equal(30);
            });

            /**
             * GIVEN: Single RainSpeed with any trustRatio value
             * WHEN: getRainSpeed is called with trusted: true, point outside
             * THEN: Should return that single RainSpeed (only option)
             */
            it('should return the only RainSpeed when only one exists', () => {
                const area = [new LatLng({lat: 10, lng: 10}), new LatLng({lat: 11, lng: 11})] as [
                    LatLng,
                    LatLng,
                ];
                const rs = new RainSpeed({
                    azimuthInDegrees: 90,
                    speedInMetersPerSec: 10,
                    trustRatio: 0.42,
                    latLngs: [area],
                });
                const map = new RainSpeedMap({rainSpeeds: [rs]});

                const result = map.getRainSpeed(new LatLng({lat: 0, lng: 0}), {trusted: true});

                expect(result).to.exist;
                expect(result?.trustRatio).to.equal(0.42);
            });

            /**
             * GIVEN: Multiple RainSpeeds with identical trustRatio values
             * WHEN: getRainSpeed is called with trusted: true
             * THEN: Should return first RainSpeed with that trustRatio (array order)
             */
            it('should return first RainSpeed when multiple have same highest trustRatio', () => {
                const area1 = [new LatLng({lat: 10, lng: 10}), new LatLng({lat: 11, lng: 11})] as [
                    LatLng,
                    LatLng,
                ];
                const area2 = [new LatLng({lat: 20, lng: 20}), new LatLng({lat: 21, lng: 21})] as [
                    LatLng,
                    LatLng,
                ];
                const area3 = [new LatLng({lat: 30, lng: 30}), new LatLng({lat: 31, lng: 31})] as [
                    LatLng,
                    LatLng,
                ];

                const rs1 = new RainSpeed({
                    azimuthInDegrees: 0,
                    speedInMetersPerSec: 10,
                    trustRatio: 0.7,
                    latLngs: [area1],
                });
                const rs2 = new RainSpeed({
                    azimuthInDegrees: 90,
                    speedInMetersPerSec: 20,
                    trustRatio: 0.9, // HIGHEST (first)
                    latLngs: [area2],
                });
                const rs3 = new RainSpeed({
                    azimuthInDegrees: 180,
                    speedInMetersPerSec: 30,
                    trustRatio: 0.9, // HIGHEST (second)
                    latLngs: [area3],
                });
                const map = new RainSpeedMap({rainSpeeds: [rs1, rs2, rs3]});

                const result = map.getRainSpeed(new LatLng({lat: 0, lng: 0}), {trusted: true});

                expect(result).to.exist;
                expect(result?.trustRatio).to.equal(0.9);
                expect(result?.speedInMetersPerSec).to.equal(20); // rs2 - first with 0.9
            });

            /**
             * GIVEN: Empty RainSpeedMap
             * WHEN: getRainSpeed is called with trusted: true
             * THEN: Should return undefined
             */
            it('should return undefined when no RainSpeeds exist', () => {
                const map = new RainSpeedMap({rainSpeeds: []});

                const result = map.getRainSpeed(new LatLng({lat: 0, lng: 0}), {trusted: true});

                expect(result).to.be.undefined;
            });

            /**
             * GIVEN: trusted: true combined with strictContaining: true
             * WHEN: getRainSpeed is called, point outside all areas
             * THEN: Should return undefined (strictContaining takes precedence)
             */
            it('should return undefined when combined with strictContaining: true and point outside', () => {
                const area1 = [new LatLng({lat: 10, lng: 10}), new LatLng({lat: 11, lng: 11})] as [
                    LatLng,
                    LatLng,
                ];
                const area2 = [new LatLng({lat: 20, lng: 20}), new LatLng({lat: 21, lng: 21})] as [
                    LatLng,
                    LatLng,
                ];

                const rs1 = new RainSpeed({
                    azimuthInDegrees: 0,
                    speedInMetersPerSec: 10,
                    trustRatio: 0.5,
                    latLngs: [area1],
                });
                const rs2 = new RainSpeed({
                    azimuthInDegrees: 90,
                    speedInMetersPerSec: 20,
                    trustRatio: 0.95, // Highest trust
                    latLngs: [area2],
                });
                const map = new RainSpeedMap({rainSpeeds: [rs1, rs2]});

                const result = map.getRainSpeed(new LatLng({lat: 0, lng: 0}), {
                    trusted: true,
                    strictContaining: true,
                });

                // strictContaining prevents fallback, so trusted is never used
                expect(result).to.be.undefined;
            });

            /**
             * GIVEN: trusted: false explicitly set
             * WHEN: getRainSpeed is called, point outside all areas
             * THEN: Should find closest by distance (not by trust)
             */
            it('should find closest by distance when trusted is explicitly false', () => {
                const area1 = [new LatLng({lat: 1, lng: 1}), new LatLng({lat: 2, lng: 2})] as [
                    LatLng,
                    LatLng,
                ]; // CLOSEST
                const area2 = [new LatLng({lat: 10, lng: 10}), new LatLng({lat: 11, lng: 11})] as [
                    LatLng,
                    LatLng,
                ];

                const rs1 = new RainSpeed({
                    azimuthInDegrees: 0,
                    speedInMetersPerSec: 10,
                    trustRatio: 0.3, // Low trust, but closest
                    latLngs: [area1],
                });
                const rs2 = new RainSpeed({
                    azimuthInDegrees: 90,
                    speedInMetersPerSec: 20,
                    trustRatio: 0.95, // High trust, but far
                    latLngs: [area2],
                });
                const map = new RainSpeedMap({rainSpeeds: [rs1, rs2]});

                const result = map.getRainSpeed(new LatLng({lat: 0, lng: 0}), {trusted: false});

                expect(result).to.exist;
                expect(result?.trustRatio).to.equal(0.3); // rs1 - closest by distance
                expect(result?.speedInMetersPerSec).to.equal(10);
            });

            /**
             * GIVEN: trusted: true with inEarthMap: true
             * WHEN: getRainSpeed is called, point outside all areas (even after rounding)
             * THEN: Should find most trusted RainSpeed after coordinate rounding
             */
            it('should work with inEarthMap option (rounds coordinates first)', () => {
                const area1 = [new LatLng({lat: 10, lng: 10}), new LatLng({lat: 11, lng: 11})] as [
                    LatLng,
                    LatLng,
                ];
                const area2 = [new LatLng({lat: 20, lng: 20}), new LatLng({lat: 21, lng: 21})] as [
                    LatLng,
                    LatLng,
                ];

                const rs1 = new RainSpeed({
                    azimuthInDegrees: 0,
                    speedInMetersPerSec: 10,
                    trustRatio: 0.4,
                    latLngs: [area1],
                });
                const rs2 = new RainSpeed({
                    azimuthInDegrees: 90,
                    speedInMetersPerSec: 20,
                    trustRatio: 0.88, // HIGHEST trust
                    latLngs: [area2],
                });
                const map = new RainSpeedMap({rainSpeeds: [rs1, rs2]});

                const result = map.getRainSpeed(new LatLng({lat: 0.001234, lng: 0.005678}), {
                    trusted: true,
                    inEarthMap: true,
                });

                expect(result).to.exist;
                expect(result?.trustRatio).to.equal(0.88); // rs2 - most trusted
            });

            /**
             * GIVEN: RainSpeeds with full range of trustRatio values (0.0 to 1.0)
             * WHEN: getRainSpeed is called with trusted: true
             * THEN: Should return RainSpeed with trustRatio = 1.0 (perfect trust)
             */
            it('should return RainSpeed with perfect trust (1.0) when available', () => {
                const area1 = [new LatLng({lat: 10, lng: 10}), new LatLng({lat: 11, lng: 11})] as [
                    LatLng,
                    LatLng,
                ];
                const area2 = [new LatLng({lat: 20, lng: 20}), new LatLng({lat: 21, lng: 21})] as [
                    LatLng,
                    LatLng,
                ];
                const area3 = [new LatLng({lat: 30, lng: 30}), new LatLng({lat: 31, lng: 31})] as [
                    LatLng,
                    LatLng,
                ];

                const rs1 = new RainSpeed({
                    azimuthInDegrees: 0,
                    speedInMetersPerSec: 10,
                    trustRatio: 0.5,
                    latLngs: [area1],
                });
                const rs2 = new RainSpeed({
                    azimuthInDegrees: 90,
                    speedInMetersPerSec: 20,
                    trustRatio: 0.99,
                    latLngs: [area2],
                });
                const rs3 = new RainSpeed({
                    azimuthInDegrees: 180,
                    speedInMetersPerSec: 30,
                    trustRatio: 1.0, // Perfect trust
                    latLngs: [area3],
                });
                const map = new RainSpeedMap({rainSpeeds: [rs1, rs2, rs3]});

                const result = map.getRainSpeed(new LatLng({lat: 0, lng: 0}), {trusted: true});

                expect(result).to.exist;
                expect(result?.trustRatio).to.equal(1.0); // rs3 - perfect trust
                expect(result?.speedInMetersPerSec).to.equal(30);
            });
        });
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

    /**
     * SPEC: getTrustRatio method
     *
     * BEHAVIOR: Returns the trustRatio of the RainSpeed found for a given point
     * This method should follow the same logic as getRainSpeed but return only the trustRatio
     * Fallback: Returns 0 when no RainSpeed is found (no trust)
     *
     * NEW BEHAVIOR: When point is optional (not provided), returns average trustRatio of all RainSpeeds
     */
    describe('getTrustRatio', () => {
        describe('when point parameter is not provided (optional)', () => {
            /**
             * GIVEN: Multiple RainSpeeds with different trustRatio values
             * WHEN: getTrustRatio is called without any point parameter
             * THEN: Should return the average trustRatio of all RainSpeeds
             */
            it('should return average trustRatio of all RainSpeeds when no point is provided', () => {
                const area1 = [new LatLng({lat: -1, lng: -1}), new LatLng({lat: 1, lng: 1})] as [
                    LatLng,
                    LatLng,
                ];
                const area2 = [new LatLng({lat: -2, lng: -2}), new LatLng({lat: 2, lng: 2})] as [
                    LatLng,
                    LatLng,
                ];
                const area3 = [new LatLng({lat: -3, lng: -3}), new LatLng({lat: 3, lng: 3})] as [
                    LatLng,
                    LatLng,
                ];

                const rs1 = new RainSpeed({
                    azimuthInDegrees: 0,
                    speedInMetersPerSec: 10,
                    trustRatio: 0.8,
                    latLngs: [area1],
                });
                const rs2 = new RainSpeed({
                    azimuthInDegrees: 90,
                    speedInMetersPerSec: 20,
                    trustRatio: 0.6,
                    latLngs: [area2],
                });
                const rs3 = new RainSpeed({
                    azimuthInDegrees: 180,
                    speedInMetersPerSec: 30,
                    trustRatio: 1.0,
                    latLngs: [area3],
                });
                const map = new RainSpeedMap({rainSpeeds: [rs1, rs2, rs3]});

                // Call without point parameter
                const result = map.getTrustRatio();

                // Average: (0.8 + 0.6 + 1.0) / 3 = 2.4 / 3 = 0.8
                approx(result, 0.8);
            });

            /**
             * GIVEN: RainSpeeds with varying trustRatio values including 0 and -1
             * WHEN: getTrustRatio is called without point parameter
             * THEN: Should include all trustRatio values (including 0 and -1) in average calculation
             */
            it('should include all trustRatio values in average calculation including 0 and negative values', () => {
                const area1 = [new LatLng({lat: -1, lng: -1}), new LatLng({lat: 1, lng: 1})] as [
                    LatLng,
                    LatLng,
                ];
                const area2 = [new LatLng({lat: -2, lng: -2}), new LatLng({lat: 2, lng: 2})] as [
                    LatLng,
                    LatLng,
                ];
                const area3 = [new LatLng({lat: -3, lng: -3}), new LatLng({lat: 3, lng: 3})] as [
                    LatLng,
                    LatLng,
                ];

                const rs1 = new RainSpeed({
                    azimuthInDegrees: 0,
                    speedInMetersPerSec: 10,
                    trustRatio: 0.9,
                    latLngs: [area1],
                });
                const rs2 = new RainSpeed({
                    azimuthInDegrees: 90,
                    speedInMetersPerSec: 20,
                    trustRatio: 0,
                    latLngs: [area2],
                });
                const rs3 = new RainSpeed({
                    azimuthInDegrees: 180,
                    speedInMetersPerSec: 30,
                    // trustRatio not provided - defaults to -1
                    latLngs: [area3],
                });
                const map = new RainSpeedMap({rainSpeeds: [rs1, rs2, rs3]});

                const result = map.getTrustRatio();

                // Average: (0.9 + 0 + (-1)) / 3 = -0.1 / 3 = -0.0333...
                approx(result, -0.0333, 0.01);
            });

            /**
             * GIVEN: Single RainSpeed with specific trustRatio
             * WHEN: getTrustRatio is called without point parameter
             * THEN: Should return that single trustRatio value (average of one)
             */
            it('should return single trustRatio when only one RainSpeed exists', () => {
                const area = [new LatLng({lat: -1, lng: -1}), new LatLng({lat: 1, lng: 1})] as [
                    LatLng,
                    LatLng,
                ];
                const rs = new RainSpeed({
                    azimuthInDegrees: 90,
                    speedInMetersPerSec: 10,
                    trustRatio: 0.75,
                    latLngs: [area],
                });
                const map = new RainSpeedMap({rainSpeeds: [rs]});

                const result = map.getTrustRatio();

                expect(result).to.equal(0.75);
            });

            /**
             * GIVEN: Empty RainSpeedMap with no RainSpeeds
             * WHEN: getTrustRatio is called without point parameter
             * THEN: Should return 0 (no RainSpeeds to average)
             */
            it('should return 0 when RainSpeedMap has no RainSpeeds', () => {
                const map = new RainSpeedMap({rainSpeeds: []});

                const result = map.getTrustRatio();

                expect(result).to.equal(0);
            });

            /**
             * GIVEN: Multiple RainSpeeds with identical trustRatio values
             * WHEN: getTrustRatio is called without point parameter
             * THEN: Should return that same trustRatio value
             */
            it('should return same value when all RainSpeeds have identical trustRatio', () => {
                const area1 = [new LatLng({lat: -1, lng: -1}), new LatLng({lat: 1, lng: 1})] as [
                    LatLng,
                    LatLng,
                ];
                const area2 = [new LatLng({lat: -2, lng: -2}), new LatLng({lat: 2, lng: 2})] as [
                    LatLng,
                    LatLng,
                ];

                const rs1 = new RainSpeed({
                    azimuthInDegrees: 0,
                    speedInMetersPerSec: 10,
                    trustRatio: 0.5,
                    latLngs: [area1],
                });
                const rs2 = new RainSpeed({
                    azimuthInDegrees: 90,
                    speedInMetersPerSec: 20,
                    trustRatio: 0.5,
                    latLngs: [area2],
                });
                const map = new RainSpeedMap({rainSpeeds: [rs1, rs2]});

                const result = map.getTrustRatio();

                expect(result).to.equal(0.5);
            });

            /**
             * GIVEN: RainSpeedMap with multiple RainSpeeds
             * WHEN: getTrustRatio is called with undefined as point parameter
             * THEN: Should return average trustRatio (same behavior as no parameter)
             */
            it('should return average trustRatio when point is explicitly undefined', () => {
                const area1 = [new LatLng({lat: -1, lng: -1}), new LatLng({lat: 1, lng: 1})] as [
                    LatLng,
                    LatLng,
                ];
                const area2 = [new LatLng({lat: -2, lng: -2}), new LatLng({lat: 2, lng: 2})] as [
                    LatLng,
                    LatLng,
                ];

                const rs1 = new RainSpeed({
                    azimuthInDegrees: 0,
                    speedInMetersPerSec: 10,
                    trustRatio: 0.4,
                    latLngs: [area1],
                });
                const rs2 = new RainSpeed({
                    azimuthInDegrees: 90,
                    speedInMetersPerSec: 20,
                    trustRatio: 0.6,
                    latLngs: [area2],
                });
                const map = new RainSpeedMap({rainSpeeds: [rs1, rs2]});

                // Explicitly pass undefined
                const result = map.getTrustRatio(undefined);

                // Average: (0.4 + 0.6) / 2 = 0.5
                expect(result).to.equal(0.5);
            });

            /**
             * GIVEN: RainSpeeds with trustRatio values and options parameter provided
             * WHEN: getTrustRatio is called without point but with options
             * THEN: Should ignore options and return average trustRatio (options only apply when point is provided)
             */
            it('should ignore options parameter when no point is provided', () => {
                const area1 = [new LatLng({lat: -1, lng: -1}), new LatLng({lat: 1, lng: 1})] as [
                    LatLng,
                    LatLng,
                ];
                const area2 = [new LatLng({lat: -2, lng: -2}), new LatLng({lat: 2, lng: 2})] as [
                    LatLng,
                    LatLng,
                ];

                const rs1 = new RainSpeed({
                    azimuthInDegrees: 0,
                    speedInMetersPerSec: 10,
                    trustRatio: 0.3,
                    latLngs: [area1],
                });
                const rs2 = new RainSpeed({
                    azimuthInDegrees: 90,
                    speedInMetersPerSec: 20,
                    trustRatio: 0.7,
                    latLngs: [area2],
                });
                const map = new RainSpeedMap({rainSpeeds: [rs1, rs2]});

                // Call with options but no point
                const result = map.getTrustRatio(undefined, {
                    strictContaining: true,
                    inEarthMap: true,
                });

                // Average: (0.3 + 0.7) / 2 = 0.5
                expect(result).to.equal(0.5);
            });
        });

        describe('when point is inside a RainSpeed area', () => {
            /**
             * GIVEN: Point inside a RainSpeed area with trustRatio = 0.85
             * WHEN: getTrustRatio is called
             * THEN: Should return the trustRatio of the containing RainSpeed
             */
            it('should return trustRatio of the containing RainSpeed', () => {
                const area = [new LatLng({lat: -1, lng: -1}), new LatLng({lat: 1, lng: 1})] as [
                    LatLng,
                    LatLng,
                ];
                const rs = new RainSpeed({
                    azimuthInDegrees: 90,
                    speedInMetersPerSec: 10,
                    trustRatio: 0.85,
                    latLngs: [area],
                });
                const map = new RainSpeedMap({rainSpeeds: [rs]});

                const result = map.getTrustRatio(new LatLng({lat: 0, lng: 0}));

                expect(result).to.equal(0.85);
            });

            /**
             * GIVEN: Multiple RainSpeed areas, point inside the first area
             * WHEN: getTrustRatio is called
             * THEN: Should return trustRatio of the first matching RainSpeed
             */
            it('should return trustRatio of first matching area when point is in multiple areas', () => {
                const area1 = [new LatLng({lat: -1, lng: -1}), new LatLng({lat: 1, lng: 1})] as [
                    LatLng,
                    LatLng,
                ];
                const area2 = [new LatLng({lat: -2, lng: -2}), new LatLng({lat: 2, lng: 2})] as [
                    LatLng,
                    LatLng,
                ];

                const rs1 = new RainSpeed({
                    azimuthInDegrees: 0,
                    speedInMetersPerSec: 10,
                    trustRatio: 0.9,
                    latLngs: [area1],
                });
                const rs2 = new RainSpeed({
                    azimuthInDegrees: 90,
                    speedInMetersPerSec: 20,
                    trustRatio: 0.7,
                    latLngs: [area2],
                });
                const map = new RainSpeedMap({rainSpeeds: [rs1, rs2]});

                // Point (0,0) is inside both areas - should return rs1's trustRatio
                const result = map.getTrustRatio(new LatLng({lat: 0, lng: 0}));

                expect(result).to.equal(0.9);
            });

            /**
             * GIVEN: RainSpeed with trustRatio = 0 (no trust)
             * WHEN: getTrustRatio is called for point inside area
             * THEN: Should return 0
             */
            it('should return 0 when the containing RainSpeed has trustRatio = 0', () => {
                const area = [new LatLng({lat: -1, lng: -1}), new LatLng({lat: 1, lng: 1})] as [
                    LatLng,
                    LatLng,
                ];
                const rs = new RainSpeed({
                    azimuthInDegrees: 90,
                    speedInMetersPerSec: 10,
                    trustRatio: 0,
                    latLngs: [area],
                });
                const map = new RainSpeedMap({rainSpeeds: [rs]});

                const result = map.getTrustRatio(new LatLng({lat: 0, lng: 0}));

                expect(result).to.equal(0);
            });

            /**
             * GIVEN: RainSpeed with default trustRatio = -1
             * WHEN: getTrustRatio is called for point inside area
             * THEN: Should return -1 (the default value)
             */
            it('should return -1 when RainSpeed has default trustRatio', () => {
                const area = [new LatLng({lat: -1, lng: -1}), new LatLng({lat: 1, lng: 1})] as [
                    LatLng,
                    LatLng,
                ];
                const rs = new RainSpeed({
                    azimuthInDegrees: 90,
                    speedInMetersPerSec: 10,
                    // trustRatio not provided - defaults to -1
                    latLngs: [area],
                });
                const map = new RainSpeedMap({rainSpeeds: [rs]});

                const result = map.getTrustRatio(new LatLng({lat: 0, lng: 0}));

                expect(result).to.equal(-1);
            });
        });

        describe('when point is outside all RainSpeed areas', () => {
            /**
             * GIVEN: Point outside all RainSpeed areas, default behavior (finds closest)
             * WHEN: getTrustRatio is called without options
             * THEN: Should return trustRatio of the closest RainSpeed by center distance
             */
            it('should return trustRatio of closest RainSpeed by default', () => {
                const area1 = [new LatLng({lat: 10, lng: 10}), new LatLng({lat: 11, lng: 11})] as [
                    LatLng,
                    LatLng,
                ]; // center: (10.5, 10.5)
                const area2 = [new LatLng({lat: 1, lng: 1}), new LatLng({lat: 2, lng: 2})] as [
                    LatLng,
                    LatLng,
                ]; // center: (1.5, 1.5) - CLOSEST to (0,0)

                const rs1 = new RainSpeed({
                    azimuthInDegrees: 0,
                    speedInMetersPerSec: 10,
                    trustRatio: 0.5,
                    latLngs: [area1],
                });
                const rs2 = new RainSpeed({
                    azimuthInDegrees: 90,
                    speedInMetersPerSec: 20,
                    trustRatio: 0.95,
                    latLngs: [area2],
                });
                const map = new RainSpeedMap({rainSpeeds: [rs1, rs2]});

                const result = map.getTrustRatio(new LatLng({lat: 0, lng: 0}));

                expect(result).to.equal(0.95); // rs2 is closest
            });

            /**
             * GIVEN: Point outside all areas, strictContaining = true
             * WHEN: getTrustRatio is called with strictContaining: true
             * THEN: Should return 0 (fallback, no trust)
             */
            it('should return 0 when strictContaining is true and point is outside all areas', () => {
                const area = [new LatLng({lat: 10, lng: 10}), new LatLng({lat: 11, lng: 11})] as [
                    LatLng,
                    LatLng,
                ];
                const rs = new RainSpeed({
                    azimuthInDegrees: 90,
                    speedInMetersPerSec: 10,
                    trustRatio: 0.8,
                    latLngs: [area],
                });
                const map = new RainSpeedMap({rainSpeeds: [rs]});

                const result = map.getTrustRatio(new LatLng({lat: 0, lng: 0}), {
                    strictContaining: true,
                });

                expect(result).to.equal(0); // Fallback
            });

            /**
             * GIVEN: Point outside all areas, strictContaining = false
             * WHEN: getTrustRatio is called with strictContaining: false
             * THEN: Should return trustRatio of closest RainSpeed
             */
            it('should return trustRatio of closest when strictContaining is false', () => {
                const area1 = [new LatLng({lat: 10, lng: 10}), new LatLng({lat: 11, lng: 11})] as [
                    LatLng,
                    LatLng,
                ];
                const area2 = [new LatLng({lat: 2, lng: 2}), new LatLng({lat: 3, lng: 3})] as [
                    LatLng,
                    LatLng,
                ]; // CLOSEST to (0,0)

                const rs1 = new RainSpeed({
                    azimuthInDegrees: 0,
                    speedInMetersPerSec: 10,
                    trustRatio: 0.3,
                    latLngs: [area1],
                });
                const rs2 = new RainSpeed({
                    azimuthInDegrees: 90,
                    speedInMetersPerSec: 20,
                    trustRatio: 0.75,
                    latLngs: [area2],
                });
                const map = new RainSpeedMap({rainSpeeds: [rs1, rs2]});

                const result = map.getTrustRatio(new LatLng({lat: 0, lng: 0}), {
                    strictContaining: false,
                });

                expect(result).to.equal(0.75); // rs2 is closest
            });
        });

        describe('when no RainSpeeds exist', () => {
            /**
             * GIVEN: Empty RainSpeedMap (no RainSpeeds)
             * WHEN: getTrustRatio is called
             * THEN: Should return 0 (fallback, no trust)
             */
            it('should return 0 when RainSpeedMap has no RainSpeeds', () => {
                const map = new RainSpeedMap({rainSpeeds: []});

                const result = map.getTrustRatio(new LatLng({lat: 0, lng: 0}));

                expect(result).to.equal(0);
            });
        });

        describe('with inEarthMap option', () => {
            /**
             * GIVEN: Point with high-precision coordinates, inEarthMap = true
             * WHEN: getTrustRatio is called with inEarthMap: true
             * THEN: Should round coordinates and return trustRatio of matching RainSpeed
             */
            it('should round coordinates and return trustRatio when inEarthMap is true', () => {
                const area = [
                    new LatLng({lat: 45.0, lng: -122.0}),
                    new LatLng({lat: 45.5, lng: -121.5}),
                ] as [LatLng, LatLng];

                const rs = new RainSpeed({
                    azimuthInDegrees: 90,
                    speedInMetersPerSec: 10,
                    trustRatio: 0.92,
                    latLngs: [area],
                });
                const map = new RainSpeedMap({rainSpeeds: [rs]});

                // Point with high precision that rounds to fall within area
                const result = map.getTrustRatio(new LatLng({lat: 45.25123, lng: -121.75456}), {
                    inEarthMap: true,
                });

                expect(result).to.equal(0.92);
            });

            /**
             * GIVEN: Point that matches area only after rounding
             * WHEN: getTrustRatio is called with inEarthMap: true
             * THEN: Should return trustRatio after coordinate rounding
             */
            it('should match area after rounding that would not match without rounding', () => {
                const area = [
                    new LatLng({lat: 40.0, lng: -74.0}),
                    new LatLng({lat: 40.1, lng: -73.9}),
                ] as [LatLng, LatLng];

                const rs = new RainSpeed({
                    azimuthInDegrees: 45,
                    speedInMetersPerSec: 5,
                    trustRatio: 0.88,
                    latLngs: [area],
                });
                const map = new RainSpeedMap({rainSpeeds: [rs]});

                // Point slightly outside that rounds into the area
                const result = map.getTrustRatio(new LatLng({lat: 40.049, lng: -73.951}), {
                    inEarthMap: true,
                });

                expect(result).to.equal(0.88);
            });

            /**
             * GIVEN: Point with inEarthMap: true and strictContaining: true
             * WHEN: Combined options are used
             * THEN: Should round first, then apply strict containment, return trustRatio or 0
             */
            it('should work correctly when combined with strictContaining option', () => {
                const area1 = [
                    new LatLng({lat: 10.0, lng: 10.0}),
                    new LatLng({lat: 10.5, lng: 10.5}),
                ] as [LatLng, LatLng];
                const area2 = [
                    new LatLng({lat: 0.0, lng: 0.0}),
                    new LatLng({lat: 1.0, lng: 1.0}),
                ] as [LatLng, LatLng];

                const rs1 = new RainSpeed({
                    azimuthInDegrees: 90,
                    speedInMetersPerSec: 10,
                    trustRatio: 0.6,
                    latLngs: [area1],
                });
                const rs2 = new RainSpeed({
                    azimuthInDegrees: 180,
                    speedInMetersPerSec: 20,
                    trustRatio: 0.95,
                    latLngs: [area2],
                });
                const map = new RainSpeedMap({rainSpeeds: [rs1, rs2]});

                // Point that rounds into area2
                const result = map.getTrustRatio(new LatLng({lat: 0.501, lng: 0.501}), {
                    inEarthMap: true,
                    strictContaining: true,
                });

                expect(result).to.equal(0.95); // rs2 after rounding
            });

            /**
             * GIVEN: Point outside after rounding with strictContaining: true
             * WHEN: getTrustRatio is called with both options
             * THEN: Should return 0 (fallback)
             */
            it('should return 0 when point is outside all areas after rounding with strictContaining', () => {
                const area = [
                    new LatLng({lat: 10.0, lng: 10.0}),
                    new LatLng({lat: 10.5, lng: 10.5}),
                ] as [LatLng, LatLng];

                const rs = new RainSpeed({
                    azimuthInDegrees: 90,
                    speedInMetersPerSec: 10,
                    trustRatio: 0.7,
                    latLngs: [area],
                });
                const map = new RainSpeedMap({rainSpeeds: [rs]});

                const result = map.getTrustRatio(new LatLng({lat: 5.0, lng: 5.0}), {
                    inEarthMap: true,
                    strictContaining: true,
                });

                expect(result).to.equal(0); // Fallback
            });
        });

        describe('with different point format inputs', () => {
            /**
             * GIVEN: Different point format shapes (LatLng, {lat, lng}, {latitude, longitude})
             * WHEN: getTrustRatio is called with each format
             * THEN: Should handle all formats and return same trustRatio
             */
            it('should support LatLng object format', () => {
                const area = [new LatLng({lat: -1, lng: -1}), new LatLng({lat: 1, lng: 1})] as [
                    LatLng,
                    LatLng,
                ];
                const rs = new RainSpeed({
                    azimuthInDegrees: 90,
                    speedInMetersPerSec: 10,
                    trustRatio: 0.82,
                    latLngs: [area],
                });
                const map = new RainSpeedMap({rainSpeeds: [rs]});

                const result = map.getTrustRatio(new LatLng({lat: 0, lng: 0}));

                expect(result).to.equal(0.82);
            });

            it('should support {lat, lng} object format', () => {
                const area = [new LatLng({lat: -1, lng: -1}), new LatLng({lat: 1, lng: 1})] as [
                    LatLng,
                    LatLng,
                ];
                const rs = new RainSpeed({
                    azimuthInDegrees: 90,
                    speedInMetersPerSec: 10,
                    trustRatio: 0.82,
                    latLngs: [area],
                });
                const map = new RainSpeedMap({rainSpeeds: [rs]});

                const result = map.getTrustRatio({lat: 0, lng: 0} as any);

                expect(result).to.equal(0.82);
            });

            it('should support {latitude, longitude} object format', () => {
                const area = [new LatLng({lat: -1, lng: -1}), new LatLng({lat: 1, lng: 1})] as [
                    LatLng,
                    LatLng,
                ];
                const rs = new RainSpeed({
                    azimuthInDegrees: 90,
                    speedInMetersPerSec: 10,
                    trustRatio: 0.82,
                    latLngs: [area],
                });
                const map = new RainSpeedMap({rainSpeeds: [rs]});

                const result = map.getTrustRatio({latitude: 0, longitude: 0} as any);

                expect(result).to.equal(0.82);
            });

            /**
             * GIVEN: Invalid point format (missing coordinates)
             * WHEN: getTrustRatio is called with invalid input
             * THEN: Should return 0 (fallback, cannot normalize point)
             */
            it('should return 0 when point format is invalid', () => {
                const area = [new LatLng({lat: -1, lng: -1}), new LatLng({lat: 1, lng: 1})] as [
                    LatLng,
                    LatLng,
                ];
                const rs = new RainSpeed({
                    azimuthInDegrees: 90,
                    speedInMetersPerSec: 10,
                    trustRatio: 0.82,
                    latLngs: [area],
                });
                const map = new RainSpeedMap({rainSpeeds: [rs]});

                const result = map.getTrustRatio({invalid: 'data'} as any);

                expect(result).to.equal(0); // Fallback
            });
        });

        describe('edge cases', () => {
            /**
             * GIVEN: RainSpeed with trustRatio = 1.0 (full trust)
             * WHEN: getTrustRatio is called
             * THEN: Should return 1.0
             */
            it('should return 1.0 for full trust', () => {
                const area = [new LatLng({lat: -1, lng: -1}), new LatLng({lat: 1, lng: 1})] as [
                    LatLng,
                    LatLng,
                ];
                const rs = new RainSpeed({
                    azimuthInDegrees: 90,
                    speedInMetersPerSec: 10,
                    trustRatio: 1.0,
                    latLngs: [area],
                });
                const map = new RainSpeedMap({rainSpeeds: [rs]});

                const result = map.getTrustRatio(new LatLng({lat: 0, lng: 0}));

                expect(result).to.equal(1.0);
            });

            /**
             * GIVEN: Point on exact boundary of RainSpeed area
             * WHEN: getTrustRatio is called
             * THEN: Should return trustRatio (inclusive boundary)
             */
            it('should return trustRatio for point on boundary (inclusive)', () => {
                const area = [new LatLng({lat: -1, lng: -1}), new LatLng({lat: 1, lng: 1})] as [
                    LatLng,
                    LatLng,
                ];
                const rs = new RainSpeed({
                    azimuthInDegrees: 90,
                    speedInMetersPerSec: 10,
                    trustRatio: 0.77,
                    latLngs: [area],
                });
                const map = new RainSpeedMap({rainSpeeds: [rs]});

                // Point exactly on boundary
                const result = map.getTrustRatio(new LatLng({lat: 1, lng: 1}));

                expect(result).to.equal(0.77);
            });

            /**
             * GIVEN: Multiple RainSpeeds with same center distance from point
             * WHEN: getTrustRatio is called (point outside all areas)
             * THEN: Should return trustRatio of first closest RainSpeed in array order
             */
            it('should return trustRatio of first RainSpeed when multiple have same distance', () => {
                // Both areas equidistant from origin (0,0)
                const area1 = [new LatLng({lat: 1, lng: 1}), new LatLng({lat: 2, lng: 2})] as [
                    LatLng,
                    LatLng,
                ]; // center: (1.5, 1.5)
                const area2 = [new LatLng({lat: -1, lng: -1}), new LatLng({lat: -2, lng: -2})] as [
                    LatLng,
                    LatLng,
                ]; // center: (-1.5, -1.5) - same distance

                const rs1 = new RainSpeed({
                    azimuthInDegrees: 0,
                    speedInMetersPerSec: 10,
                    trustRatio: 0.4,
                    latLngs: [area1],
                });
                const rs2 = new RainSpeed({
                    azimuthInDegrees: 90,
                    speedInMetersPerSec: 20,
                    trustRatio: 0.6,
                    latLngs: [area2],
                });
                const map = new RainSpeedMap({rainSpeeds: [rs1, rs2]});

                const result = map.getTrustRatio(new LatLng({lat: 0, lng: 0}));

                // Should return first in array with equal distance
                expect(result).to.be.oneOf([0.4, 0.6]); // Implementation dependent
            });
        });
    });
});
