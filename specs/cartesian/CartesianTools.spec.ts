import {expect} from 'chai';
import {CartesianPixelPosition, CartesianTools, LatLng, RainNode} from '../../src';

describe('CartesianTools', () => {
    it('should get roundLatLng', () => {
        expect(CartesianTools.RoundLatLng(12.1234)).eq(12.120000000000001);
        expect(CartesianTools.RoundLatLng(12.1234, 0.005)).eq(12.125);
        expect(CartesianTools.RoundLatLng(12.1234, 0.001)).eq(12.123000000000001); // => needPrecision
        expect(CartesianTools.RoundLatLng(12.1234, 0.001, true)).eq(12.123);
        expect(CartesianTools.RoundLatLng(12.1234, 0.01, true)).eq(12.12);
        expect(CartesianTools.RoundLatLng(12.1234, 0.1, true)).eq(12.1);
        expect(CartesianTools.RoundLatLng(12.1234, 1)).eq(12);

        expect(CartesianTools.RoundLatLng(-2.8000000000000003, 0.1, true)).eq(-2.8);
        expect(CartesianTools.RoundLatLng(-2.8000000000000003, 0.002, true)).eq(-2.8);

        expect(CartesianTools.RoundLatLng(-23.8, 10)).eq(-20);
        expect(CartesianTools.RoundLatLng(345.12, 200)).eq(400);
    });

    it('should isAroundLatLng', () => {
        const centerLatLng = {lat: 12.3456, lng: 1.234};
        const center = new LatLng(centerLatLng);

        expect(CartesianTools.IsAroundLatLng(center, new LatLng(centerLatLng))).eq(true);
        expect(CartesianTools.IsAroundLatLng(center, new LatLng({lat: 12.3457, lng: 1.234}))).eq(
            true
        );
        expect(CartesianTools.IsAroundLatLng(center, new LatLng({lat: 12.0006, lng: 1.234}))).eq(
            false
        );

        expect(
            CartesianTools.IsAroundLatLng(center, new LatLng(centerLatLng), {
                scaleLatLng: new LatLng({lat: 0.1, lng: 0.1}),
            })
        ).eq(true);
        expect(
            CartesianTools.IsAroundLatLng(center, new LatLng({lat: 12.3556, lng: 1.234}), {
                scaleLatLng: new LatLng({lat: 0.1, lng: 0.1}),
            })
        ).eq(false);

        expect(
            CartesianTools.IsAroundLatLng(center, new LatLng(centerLatLng), {
                stepRange: 1,
                scaleLatLng: new LatLng({lat: 0.1, lng: 0.1}),
            })
        ).eq(true);
        expect(
            CartesianTools.IsAroundLatLng(center, new LatLng({lat: 12.3457, lng: 1.234}), {
                stepRange: 1,
                scaleLatLng: new LatLng({lat: 0.1, lng: 0.1}),
            })
        ).eq(true);
        expect(
            CartesianTools.IsAroundLatLng(center, new LatLng({lat: 12.3457, lng: 1.434}), {
                stepRange: 1,
                scaleLatLng: new LatLng({lat: 0.1, lng: 0.1}),
            })
        ).eq(false);

        expect(
            CartesianTools.IsAroundLatLng(center, new LatLng(centerLatLng), {
                stepRange: 6,
                scaleLatLng: new LatLng({lat: 0.01, lng: 0.01}),
            })
        ).eq(true);
        expect(
            CartesianTools.IsAroundLatLng(center, new LatLng({lat: 12.3456, lng: 1.299}), {
                stepRange: 6,
                scaleLatLng: new LatLng({lat: 0.01, lng: 0.01}),
            })
        ).eq(false);

        expect(
            CartesianTools.IsAroundLatLng(center, new LatLng(centerLatLng), {
                stepRange: 0,
                inEarthMap: true,
            })
        ).eq(true);
        // centerLatLng.lat - 0.001 = 12.3446 is in the SAME pixel as 12.3456 ([12.34, 12.35))
        // So with stepRange 0, it should return true
        expect(
            CartesianTools.IsAroundLatLng(
                center,
                new LatLng({lat: centerLatLng.lat - 0.001, lng: centerLatLng.lng + 0.001}),
                {
                    stepRange: 0,
                    inEarthMap: true,
                }
            )
        ).eq(true);
        // With stepRange 1, also true (same pixel)
        expect(
            CartesianTools.IsAroundLatLng(
                center,
                new LatLng({lat: centerLatLng.lat - 0.001, lng: centerLatLng.lng + 0.001}),
                {
                    stepRange: 1,
                    inEarthMap: true,
                }
            )
        ).eq(true);
    });

    /**
     * SPEC: IsAroundLatLng with inEarthMap option
     *
     * BEHAVIOR: When inEarthMap is true, the method should check if latLngAround
     * falls within any earth pixel around the earth pixel occupied by latLngCenter
     */
    describe('IsAroundLatLng with inEarthMap option', () => {
        /**
         * GIVEN: Two points that map to the same earth pixel
         * WHEN: inEarthMap is true with stepRange 0
         * THEN: Should return true because they occupy the same pixel
         */
        it('should return true when both points map to the same earth pixel', () => {
            const centerLatLng = new LatLng({lat: 12.345, lng: 45.678});
            // Slight offset that still maps to same earth pixel
            const aroundLatLng = new LatLng({lat: 12.346, lng: 45.679});

            const result = CartesianTools.IsAroundLatLng(centerLatLng, aroundLatLng, {
                stepRange: 0,
                inEarthMap: true,
            });

            expect(result).eq(true);
        });

        /**
         * GIVEN: Two points at equator, one in adjacent earth pixel
         * WHEN: inEarthMap is true with stepRange 1
         * THEN: Should return true because adjacent pixel is within stepRange
         */
        it('should return true when latLngAround is in adjacent earth pixel (stepRange 1) at equator', () => {
            const centerLatLng = new LatLng({lat: 0, lng: 0});
            // Exactly one pixel away (0.01 degrees at equator)
            const aroundLatLng = new LatLng({lat: 0.01, lng: 0});

            const result = CartesianTools.IsAroundLatLng(centerLatLng, aroundLatLng, {
                stepRange: 1,
                inEarthMap: true,
            });

            expect(result).eq(true);
        });

        /**
         * GIVEN: Two points at equator, one in adjacent earth pixel diagonally
         * WHEN: inEarthMap is true with stepRange 1
         * THEN: Should return true because diagonal pixel is within stepRange
         */
        it('should return true when latLngAround is in diagonal earth pixel (stepRange 1)', () => {
            const centerLatLng = new LatLng({lat: 0, lng: 0});
            // Diagonal neighbor pixel
            const aroundLatLng = new LatLng({lat: 0.01, lng: 0.01});

            const result = CartesianTools.IsAroundLatLng(centerLatLng, aroundLatLng, {
                stepRange: 1,
                inEarthMap: true,
            });

            expect(result).eq(true);
        });

        /**
         * GIVEN: Two points at equator, one two pixels away
         * WHEN: inEarthMap is true with stepRange 1
         * THEN: Should return false because distance exceeds stepRange
         */
        it('should return false when latLngAround is 2 pixels away (stepRange 1)', () => {
            const centerLatLng = new LatLng({lat: 0, lng: 0});
            // Two pixels away
            const aroundLatLng = new LatLng({lat: 0.02, lng: 0});

            const result = CartesianTools.IsAroundLatLng(centerLatLng, aroundLatLng, {
                stepRange: 1,
                inEarthMap: true,
            });

            expect(result).eq(false);
        });

        /**
         * GIVEN: Two points at equator, one two pixels away
         * WHEN: inEarthMap is true with stepRange 2
         * THEN: Should return true because distance is within stepRange
         */
        it('should return true when latLngAround is 2 pixels away (stepRange 2)', () => {
            const centerLatLng = new LatLng({lat: 0, lng: 0});
            // Two pixels away
            const aroundLatLng = new LatLng({lat: 0.02, lng: 0});

            const result = CartesianTools.IsAroundLatLng(centerLatLng, aroundLatLng, {
                stepRange: 2,
                inEarthMap: true,
            });

            expect(result).eq(true);
        });

        /**
         * GIVEN: Two points at high latitude (where longitude scale differs from latitude scale)
         * WHEN: inEarthMap is true with stepRange 1
         * THEN: Should use latitude-specific longitude scale from EarthMap
         */
        it('should use latitude-specific longitude scale at high latitude', () => {
            const cartesianTools = new CartesianTools(0.01);
            const centerLatLng = new LatLng({lat: 60, lng: 0});
            // At 60° latitude, longitude scale is larger than latitude scale
            // This point should be in an adjacent pixel horizontally
            const aroundLatLng = new LatLng({lat: 60, lng: 0.02});

            const result = CartesianTools.IsAroundLatLng(centerLatLng, aroundLatLng, {
                stepRange: 1,
                inEarthMap: true,
            });

            // Should return true if longitude scale at this latitude makes 0.02° = 1 pixel step
            // The exact result depends on EarthMap's longitude scale calculation
            expect(result).to.eq(true);
        });

        /**
         * GIVEN: Two points near the poles
         * WHEN: inEarthMap is true with stepRange 1
         * THEN: Should handle extreme latitude-specific scaling correctly
         */
        it('should handle extreme longitude scaling near poles', () => {
            const cartesianTools = new CartesianTools(0.01);
            const centerLatLng = new LatLng({lat: 85, lng: 0});

            // At latitude 85°, the longitude scale is ~0.115
            // So 0.5° longitude difference = ~4.3 pixels apart
            const aroundLatLngFar = new LatLng({lat: 85, lng: 0.5});

            // With stepRange 1, should return false (too far)
            const result1 = CartesianTools.IsAroundLatLng(centerLatLng, aroundLatLngFar, {
                stepRange: 1,
                inEarthMap: true,
            });
            expect(result1).to.eq(false);

            // With stepRange 5, should return true (within 5-pixel neighborhood)
            const result2 = CartesianTools.IsAroundLatLng(centerLatLng, aroundLatLngFar, {
                stepRange: 5,
                inEarthMap: true,
            });
            expect(result2).to.eq(true);

            // Test adjacent pixel at high latitude (0.115° ~ 1 pixel)
            const aroundLatLngNear = new LatLng({lat: 85, lng: 0.115});
            const result3 = CartesianTools.IsAroundLatLng(centerLatLng, aroundLatLngNear, {
                stepRange: 1,
                inEarthMap: true,
            });
            // Should be true because they're adjacent pixels
            expect(result3).to.eq(true);
        });

        /**
         * GIVEN: Two points that are close but map to different earth pixels
         * WHEN: inEarthMap is true with stepRange 0
         * THEN: Should return false because they occupy different pixels
         */
        it('should return false when points map to different earth pixels (stepRange 0)', () => {
            const cartesianTools = new CartesianTools(0.01);
            const centerLatLng = new LatLng({lat: 0, lng: 0});
            // Far enough to be in a different pixel
            const aroundLatLng = new LatLng({lat: 0.02, lng: 0.02});

            const result = CartesianTools.IsAroundLatLng(centerLatLng, aroundLatLng, {
                stepRange: 0,
                inEarthMap: true,
            });

            expect(result).eq(false);
        });

        /**
         * GIVEN: Points with larger stepRange creating a grid neighborhood
         * WHEN: inEarthMap is true with stepRange 3
         * THEN: Should check all pixels in 7x7 grid (3 steps in each direction)
         */
        it('should check multiple pixels around center with stepRange 3', () => {
            const cartesianTools = new CartesianTools(0.01);
            const centerLatLng = new LatLng({lat: 0, lng: 0});
            // Three pixels away in both directions
            const aroundLatLng = new LatLng({lat: 0.03, lng: 0.03});

            const result = CartesianTools.IsAroundLatLng(centerLatLng, aroundLatLng, {
                stepRange: 3,
                inEarthMap: true,
            });

            expect(result).eq(true);
        });

        /**
         * GIVEN: Points just outside the stepRange grid
         * WHEN: inEarthMap is true with stepRange 3
         * THEN: Should return false
         */
        it('should return false when point is just outside stepRange 3', () => {
            const cartesianTools = new CartesianTools(0.01);
            const centerLatLng = new LatLng({lat: 0, lng: 0});
            // Four pixels away (outside stepRange 3)
            const aroundLatLng = new LatLng({lat: 0.04, lng: 0});

            const result = CartesianTools.IsAroundLatLng(centerLatLng, aroundLatLng, {
                stepRange: 3,
                inEarthMap: true,
            });

            expect(result).eq(false);
        });

        /**
         * GIVEN: Points crossing the equator
         * WHEN: inEarthMap is true with stepRange 1
         * THEN: Should handle negative/positive latitude boundary correctly
         */
        it('should handle equator crossing', () => {
            const cartesianTools = new CartesianTools(0.01);
            const centerLatLng = new LatLng({lat: -0.005, lng: 0});
            // Just across the equator
            const aroundLatLng = new LatLng({lat: 0.005, lng: 0});

            const result = CartesianTools.IsAroundLatLng(centerLatLng, aroundLatLng, {
                stepRange: 1,
                inEarthMap: true,
            });

            expect(result).to.eq(true);
        });

        /**
         * GIVEN: Points crossing the international date line
         * WHEN: inEarthMap is true with stepRange 1
         * THEN: Should handle longitude wrapping correctly
         */
        it('should handle international date line crossing', () => {
            // These two points are 0.02° apart (wrapped), which is 2 pixels
            const centerLatLng = new LatLng({lat: 0, lng: 179.99});
            const aroundLatLng = new LatLng({lat: 0, lng: -179.99});

            // With stepRange 1, should return false (they're 2 pixels apart)
            const result1 = CartesianTools.IsAroundLatLng(centerLatLng, aroundLatLng, {
                stepRange: 1,
                inEarthMap: true,
            });
            expect(result1).to.eq(false);

            // With stepRange 2, should return true (within 2-pixel neighborhood)
            const result2 = CartesianTools.IsAroundLatLng(centerLatLng, aroundLatLng, {
                stepRange: 2,
                inEarthMap: true,
            });
            expect(result2).to.eq(true);

            // Test true date line crossing that should work with stepRange 1
            // 180 and -180 are the same point (0° apart after wrapping)
            const centerDateLine = new LatLng({lat: 0, lng: 180});
            const aroundDateLine = new LatLng({lat: 0, lng: -180});
            const result3 = CartesianTools.IsAroundLatLng(centerDateLine, aroundDateLine, {
                stepRange: 0,
                inEarthMap: true,
            });
            expect(result3).to.eq(true);
        });

        /**
         * GIVEN: inEarthMap is false (default behavior)
         * WHEN: Checking if points are around each other
         * THEN: Should use standard scaleLatLng without EarthMap grid snapping
         */
        it('should not use EarthMap when inEarthMap is false', () => {
            const centerLatLng = new LatLng({lat: 12.345, lng: 45.678});
            const aroundLatLng = new LatLng({lat: 12.346, lng: 45.679});

            const resultWithEarthMap = CartesianTools.IsAroundLatLng(centerLatLng, aroundLatLng, {
                stepRange: 0,
                inEarthMap: true,
            });

            const resultWithoutEarthMap = CartesianTools.IsAroundLatLng(
                centerLatLng,
                aroundLatLng,
                {
                    stepRange: 0,
                    inEarthMap: false,
                    scaleLatLng: new LatLng({lat: 0.01, lng: 0.01}),
                }
            );

            // Both should be true in this case, but the paths are different
            expect(resultWithEarthMap).to.eq(true);
            expect(resultWithoutEarthMap).to.eq(true);
        });

        /**
         * SPEC: Edge case - Using EarthMap's pre-computed scales
         *
         * GIVEN: Two points at a latitude where longitude scale differs significantly
         * WHEN: inEarthMap is true with stepRange 1
         * THEN: Should use getScaleLatLngFromEarth for accurate pixel-based checking
         */
        it('should use EarthMap pre-computed longitude scale at mid-latitude', () => {
            const cartesianTools = new CartesianTools(0.01);
            const centerLatLng = new LatLng({lat: 45, lng: 0});

            // At 45° latitude, longitude scale should be ~0.014
            const scaleFromEarth = cartesianTools.getScaleLatLngFromEarth(centerLatLng);
            expect(scaleFromEarth.lng).eq(0.014);

            // Point one longitude pixel away at this latitude
            const aroundLatLng = new LatLng({lat: 45, lng: scaleFromEarth.lng});

            const result = CartesianTools.IsAroundLatLng(centerLatLng, aroundLatLng, {
                stepRange: 1,
                inEarthMap: true,
            });

            expect(result).eq(true);
        });

        /**
         * SPEC: Edge case - Verifying earth pixel snapping
         *
         * GIVEN: Two raw coordinates that snap to ADJACENT earth pixels
         * WHEN: inEarthMap is true
         * THEN: Should snap both to earth grid and detect adjacency correctly
         */
        it('should snap coordinates to earth grid before checking proximity', () => {
            const cartesianTools = new CartesianTools(0.01);

            // These raw coordinates snap to ADJACENT pixels
            const rawCenter = new LatLng({lat: 12.004, lng: 45.003});
            const rawAround = new LatLng({lat: 12.015, lng: 45.016}); // Different pixel

            // Verify they snap to adjacent pixels
            const snappedCenter = cartesianTools.getLatLngFromEarthMap(rawCenter);
            const snappedAround = cartesianTools.getLatLngFromEarthMap(rawAround);

            // 12.004 floors to 12.0, 12.015 floors to 12.01 (adjacent pixels)
            expect(snappedCenter.lat).eq(12.0);
            expect(snappedAround.lat).eq(12.01);
            expect(snappedCenter.lng).eq(45.0);
            expect(snappedAround.lng).eq(45.01);

            // With stepRange 0, they should NOT be around (different pixels)
            const resultStepRange0 = CartesianTools.IsAroundLatLng(rawCenter, rawAround, {
                stepRange: 0,
                inEarthMap: true,
            });
            expect(resultStepRange0).eq(false);

            // With stepRange 1, they SHOULD be around (adjacent pixels)
            const resultStepRange1 = CartesianTools.IsAroundLatLng(rawCenter, rawAround, {
                stepRange: 1,
                inEarthMap: true,
            });
            expect(resultStepRange1).eq(true);
        });

        /**
         * SPEC: Edge case - Checking all 8 surrounding pixels
         *
         * GIVEN: Center pixel and all 8 adjacent pixels (N, NE, E, SE, S, SW, W, NW)
         * WHEN: inEarthMap is true with stepRange 1
         * THEN: Should detect all 8 neighbors as "around"
         */
        it('should detect all 8 adjacent pixels as around with stepRange 1', () => {
            const centerLatLng = new LatLng({lat: 0.005, lng: 0.005}); // Center in pixel [0, 0.01)

            // 8 directions: N, NE, E, SE, S, SW, W, NW
            // Use values that floor to adjacent pixels
            const neighbors = [
                {lat: 0.015, lng: 0.005}, // N: floors to [0.01, 0]
                {lat: 0.015, lng: 0.015}, // NE: floors to [0.01, 0.01]
                {lat: 0.005, lng: 0.015}, // E: floors to [0, 0.01]
                {lat: -0.005, lng: 0.015}, // SE: floors to [-0.01, 0.01]
                {lat: -0.005, lng: 0.005}, // S: floors to [-0.01, 0]
                {lat: -0.005, lng: -0.005}, // SW: floors to [-0.01, -0.01]
                {lat: 0.005, lng: -0.005}, // W: floors to [0, -0.01]
                {lat: 0.015, lng: -0.005}, // NW: floors to [0.01, -0.01]
            ];

            for (const neighbor of neighbors) {
                const result = CartesianTools.IsAroundLatLng(centerLatLng, new LatLng(neighbor), {
                    stepRange: 1,
                    inEarthMap: true,
                });
                expect(result).eq(
                    true,
                    `Failed for neighbor at lat=${neighbor.lat}, lng=${neighbor.lng}`
                );
            }
        });

        /**
         * SPEC: Edge case - Large stepRange with real-world coordinates
         *
         * GIVEN: Two points in Paris region separated by ~50km
         * WHEN: inEarthMap is true with appropriate stepRange
         * THEN: Should correctly detect if within pixel neighborhood
         */
        it('should handle real-world coordinates with large stepRange', () => {
            const cartesianTools = new CartesianTools(0.01);
            // Paris center
            const centerLatLng = new LatLng({lat: 48.8566, lng: 2.3522});
            // ~5 pixels away (0.05 degrees ~ 5.5km at this latitude)
            const aroundLatLng = new LatLng({lat: 48.9066, lng: 2.4022});

            const result = CartesianTools.IsAroundLatLng(centerLatLng, aroundLatLng, {
                stepRange: 5,
                inEarthMap: true,
            });

            expect(result).eq(true);
        });

        /**
         * SPEC: Edge case - Zero stepRange with different pixels
         *
         * GIVEN: Two points that clearly map to different earth pixels
         * WHEN: inEarthMap is true with stepRange 0
         * THEN: Should return false (not in same pixel)
         */
        it('should return false for clearly different pixels with stepRange 0', () => {
            const cartesianTools = new CartesianTools(0.01);
            const centerLatLng = new LatLng({lat: 0, lng: 0});
            // Half a degree away = 50 pixels
            const aroundLatLng = new LatLng({lat: 0.5, lng: 0});

            const result = CartesianTools.IsAroundLatLng(centerLatLng, aroundLatLng, {
                stepRange: 0,
                inEarthMap: true,
            });

            expect(result).eq(false);
        });

        /**
         * SPEC: Boundary case - Negative latitudes and longitudes
         *
         * GIVEN: Points in southern and western hemispheres
         * WHEN: inEarthMap is true with stepRange 1
         * THEN: Should handle negative coordinates correctly
         */
        it('should handle negative coordinates correctly', () => {
            const cartesianTools = new CartesianTools(0.01);
            const centerLatLng = new LatLng({lat: -34.6037, lng: -58.3816}); // Buenos Aires
            const aroundLatLng = new LatLng({lat: -34.5937, lng: -58.3716}); // ~1km away

            const result = CartesianTools.IsAroundLatLng(centerLatLng, aroundLatLng, {
                stepRange: 1,
                inEarthMap: true,
            });

            expect(result).eq(true);
        });
    });

    it('should isNotAroundLatLng', () => {
        const center = new LatLng({lat: 12.3456, lng: 1.234});

        expect(
            CartesianTools.IsNotAroundLatLng(center, new LatLng({lat: 12.3456, lng: 1.234}), 0)
        ).eq(false);
        expect(
            CartesianTools.IsNotAroundLatLng(center, new LatLng({lat: 12.3457, lng: 1.234}), 0)
        ).eq(false);
        expect(
            CartesianTools.IsNotAroundLatLng(center, new LatLng({lat: 12.0006, lng: 1.234}), 0)
        ).eq(true);

        expect(
            CartesianTools.IsNotAroundLatLng(center, new LatLng({lat: 12.3456, lng: 1.234}), 0, 0.1)
        ).eq(false);
        expect(
            CartesianTools.IsNotAroundLatLng(center, new LatLng({lat: 12.3556, lng: 1.234}), 0, 0.1)
        ).eq(true);

        expect(
            CartesianTools.IsNotAroundLatLng(center, new LatLng({lat: 12.3456, lng: 1.234}), 1, 0.1)
        ).eq(false);
        expect(
            CartesianTools.IsNotAroundLatLng(center, new LatLng({lat: 12.3457, lng: 1.234}), 1, 0.1)
        ).eq(false);
        expect(
            CartesianTools.IsNotAroundLatLng(center, new LatLng({lat: 12.3457, lng: 1.434}), 1, 0.1)
        ).eq(true);

        expect(
            CartesianTools.IsNotAroundLatLng(
                center,
                new LatLng({lat: 12.3456, lng: 1.234}),
                6,
                0.01
            )
        ).eq(false);
        expect(
            CartesianTools.IsNotAroundLatLng(
                center,
                new LatLng({lat: 12.3456, lng: 1.299}),
                6,
                0.01
            )
        ).eq(true);
    });

    it('should GetDistanceFromLatLngInKm', () => {
        const center1 = new LatLng({lat: 0, lng: 0});
        const center2 = new LatLng({lat: 50, lng: 50});
        const center3 = new LatLng({lat: 90, lng: 90});

        expect(CartesianTools.GetDistanceFromLatLngInKm(center1, new LatLng({lat: 1, lng: 0}))).eq(
            111.19492664455873
        );
        expect(CartesianTools.GetDistanceFromLatLngInKm(center1, new LatLng({lat: 0, lng: 1}))).eq(
            111.19492664455873
        );
        // Not working: expect(CartesianTools.GetDistanceFromLatLngInKm(center2, new LatLng({lat: 51, lng: 50}))).eq(131.78047419664205);
        // Not working: expect(CartesianTools.GetDistanceFromLatLngInKm(center2, new LatLng({lat: 50, lng: 51}))).eq(131.78047419664205);
        // That's why we need => VincentyDistance (https://en.wikipedia.org/wiki/Vincenty%27s_formulae)

        expect(CartesianTools.VincentyDistance(center1, new LatLng({lat: 1, lng: 0}))).eq(
            110.57438855795695
        );
        expect(CartesianTools.VincentyDistance(center1, new LatLng({lat: 0, lng: 1}))).eq(
            111.31949079322325
        );
        expect(CartesianTools.VincentyDistance(center2, new LatLng({lat: 51, lng: 50}))).eq(
            111.23868085993506
        );
        expect(CartesianTools.VincentyDistance(center2, new LatLng({lat: 50, lng: 51}))).eq(
            71.6952196060561
        );
        expect(CartesianTools.VincentyDistance(center3, new LatLng({lat: 89, lng: 90}))).eq(
            111.69386491426462
        );
        expect(CartesianTools.VincentyDistance(center3, new LatLng({lat: 90, lng: 89}))).lessThan(
            0.001
        );
    });

    it('should getSquareFromWidthAndCenter', () => {
        const cartesianTools = new CartesianTools(CartesianTools.DEFAULT_SCALE);

        // Test with a center at the equator
        const center1 = new LatLng({lat: 0, lng: 0});
        const width1 = 10; // 10 km
        const square1 = cartesianTools.getSquareFromWidthAndCenter(width1, center1);

        // Verify the square is centered at the specified point
        const squareCenter1 = new LatLng({
            lat: (square1[0].lat + square1[1].lat) / 2,
            lng: (square1[0].lng + square1[1].lng) / 2,
        });
        expect(Math.abs(squareCenter1.lat - center1.lat)).lessThan(0.01); // Allow rounding errors due to grid alignment
        expect(Math.abs(squareCenter1.lng - center1.lng)).lessThan(0.01); // Allow rounding errors due to grid alignment

        // Verify the square has the correct width
        const squareWidth1 = CartesianTools.VincentyDistance(
            new LatLng({lat: square1[0].lat, lng: square1[0].lng}),
            new LatLng({lat: square1[0].lat, lng: square1[1].lng})
        );
        expect(Math.abs(squareWidth1 - width1)).lessThan(1.5); // Allow rounding errors due to grid alignment

        // Test with a center at a higher latitude
        const center2 = new LatLng({lat: 45, lng: 45});
        const width2 = 20; // 20 km
        const square2 = cartesianTools.getSquareFromWidthAndCenter(width2, center2);

        // Verify the square is centered at the specified point
        const squareCenter2 = new LatLng({
            lat: (square2[0].lat + square2[1].lat) / 2,
            lng: (square2[0].lng + square2[1].lng) / 2,
        });
        expect(Math.abs(squareCenter2.lat - center2.lat)).lessThan(0.01); // Allow rounding errors due to grid alignment
        expect(Math.abs(squareCenter2.lng - center2.lng)).lessThan(0.01); // Allow rounding errors due to grid alignment

        // Verify the square has the correct width
        const squareWidth2 = CartesianTools.VincentyDistance(
            new LatLng({lat: square2[0].lat, lng: square2[0].lng}),
            new LatLng({lat: square2[0].lat, lng: square2[1].lng})
        );
        expect(Math.abs(squareWidth2 - width2)).lessThan(1.5); // Allow rounding errors due to grid alignment
    });

    it('should adjustRainNodeWithSquareWidth', () => {
        const cartesianTools = new CartesianTools();
        const rainNode = new RainNode({
            id: 'notEmpty',
            name: '',
            team: null,
            latLngRectsAsJSON: '[[{"lat":49.07,"lng":2.205},{"lat":53.07,"lng":8.602}]]',
        });
        expect(rainNode.getCenter().lat).eq(51.07);
        expect(rainNode.getCenter().lng).eq(5.4035);
        cartesianTools.adjustRainNodeWithSquareWidth(rainNode, 250);

        expect(rainNode.latLngRectsAsJSON).eq(
            '[[{"lat":49.94,"lng":3.615},{"lat":52.19,"lng":7.184}]]'
        );
    });

    it('should count pixels in a square using howManyPixelsInEarthMap', () => {
        const cartesianTools = new CartesianTools();

        // Test with a small square at the equator
        const southWest1 = new LatLng({lat: 0, lng: 0});
        const northEast1 = new LatLng({lat: 0.1, lng: 0.1});
        const pixelCount1 = cartesianTools.howManyPixelsInEarthMap(southWest1, northEast1);

        expect(pixelCount1).eq(100);

        // Test with a square at a higher latitude
        const southWest2 = new LatLng({lat: 45, lng: 45});
        const northEast2 = new LatLng({lat: 45.1, lng: 45.1});
        const pixelCount2 = cartesianTools.howManyPixelsInEarthMap(southWest2, northEast2);

        // At higher latitudes, longitude steps are smaller, so we expect less pixel
        expect(pixelCount2).eq(80);

        // Test with coordinates in reverse order (should still work)
        const pixelCount3 = cartesianTools.howManyPixelsInEarthMap(northEast1, southWest1);
        expect(pixelCount3).eq(100);

        // Test with a single point (should return 0)
        const pixelCount4 = cartesianTools.howManyPixelsInEarthMap(southWest2, southWest2);
        expect(pixelCount4).eq(0);
    });

    it('should getSquaresInAreaFromEarthMap on a small area around 0/0 for 100km width', () => {
        const tools = new CartesianTools(0.01);
        const widthKm = 100;

        const areaSW = new LatLng({lat: -0.1, lng: -0.2});
        const areaNE = new LatLng({lat: 0.5, lng: 0.5});

        const squares = tools.getSquaresInAreaFromEarthMap(widthKm, areaSW, areaNE);
        expect(squares.length).to.eq(4);

        // Expect at least the square centered at 0,0 to be present
        const expectedSquare = tools.getSquareFromWidthAndCenter(
            widthKm,
            new LatLng({lat: 0, lng: 0})
        );

        const found = squares.some(
            ([sw, ne]) => sw.equals(expectedSquare[0]) && ne.equals(expectedSquare[1])
        );
        expect(found).to.equal(true);
    });

    /**
     * SPEC: getLatLngFromEarthMap with position option
     *
     * BEHAVIOR: The position option allows returning different positions within an earth pixel
     * instead of only the default south-west corner.
     *
     * GIVEN: A coordinate that maps to an earth pixel
     * WHEN: position option is specified
     * THEN: Should return the corresponding corner or center of the earth pixel
     */
    describe('getLatLngFromEarthMap - position option', () => {
        /**
         * GIVEN: A coordinate at the equator
         * WHEN: position is undefined or 'south-west' (default)
         * THEN: Should return the south-west corner of the earth pixel (current behavior)
         */
        it('should return south-west corner by default (no position specified)', () => {
            const cartesianTools = new CartesianTools(0.01);
            const input = new LatLng({lat: 0.005, lng: 0.005});

            // Without position option (default behavior)
            const result = cartesianTools.getLatLngFromEarthMap(input);

            // Should snap to south-west corner of pixel containing (0.005, 0.005)
            // Point 0.005 is in pixel [0, 0.01), so SW corner is 0.0
            expect(result.lat).eq(0);
            expect(result.lng).eq(0);
        });

        it('should return south-west corner when position is explicitly "south-west"', () => {
            const cartesianTools = new CartesianTools(0.01);
            const input = new LatLng({lat: 0.005, lng: 0.005});

            const result = cartesianTools.getLatLngFromEarthMap(input, {
                position: CartesianPixelPosition.SW,
            });

            // Point 0.005 is in pixel [0, 0.01), so SW corner is 0.0
            expect(result.lat).eq(0);
            expect(result.lng).eq(0);
        });

        /**
         * GIVEN: A coordinate at the equator
         * WHEN: position is 'south-east'
         * THEN: Should return the south-east corner of the earth pixel
         */
        it('should return south-east corner when position is "south-east"', () => {
            const cartesianTools = new CartesianTools(0.01);
            const input = new LatLng({lat: 0.005, lng: 0.005});

            const result = cartesianTools.getLatLngFromEarthMap(input, {
                position: CartesianPixelPosition.SE,
            });

            // South-east: same latitude as SW, but longitude + lngScale
            // At equator: lat = 0, lng = 0 + 0.01 = 0.01
            expect(result.lat).eq(0);
            expect(result.lng).eq(0.01);
        });

        /**
         * GIVEN: A coordinate at the equator
         * WHEN: position is 'north-west'
         * THEN: Should return the north-west corner of the earth pixel
         */
        it('should return north-west corner when position is "north-west"', () => {
            const cartesianTools = new CartesianTools(0.01);
            const input = new LatLng({lat: 0.005, lng: 0.005});

            const result = cartesianTools.getLatLngFromEarthMap(input, {
                position: CartesianPixelPosition.NW,
            });

            // North-west: latitude + latScale, same longitude as SW
            // At equator: lat = 0 + 0.01 = 0.01, lng = 0
            expect(result.lat).eq(0.01);
            expect(result.lng).eq(0);
        });

        /**
         * GIVEN: A coordinate at the equator
         * WHEN: position is 'north-east'
         * THEN: Should return the north-east corner of the earth pixel
         */
        it('should return north-east corner when position is "north-east"', () => {
            const cartesianTools = new CartesianTools(0.01);
            const input = new LatLng({lat: 0.005, lng: 0.005});

            const result = cartesianTools.getLatLngFromEarthMap(input, {
                position: CartesianPixelPosition.NE,
            });

            // North-east: both latitude and longitude increased
            // At equator: lat = 0 + 0.01 = 0.01, lng = 0 + 0.01 = 0.01
            expect(result.lat).eq(0.01);
            expect(result.lng).eq(0.01);
        });

        /**
         * GIVEN: A coordinate at the equator
         * WHEN: position is 'center'
         * THEN: Should return the center of the earth pixel
         */
        it('should return center of pixel when position is "center"', () => {
            const cartesianTools = new CartesianTools(0.01);
            const input = new LatLng({lat: 0.005, lng: 0.005});

            const result = cartesianTools.getLatLngFromEarthMap(input, {
                position: CartesianPixelPosition.C,
            });

            // Center: SW corner + half of lat/lng scales
            // At equator: lat = 0 + 0.01/2 = 0.005, lng = 0 + 0.01/2 = 0.005
            expect(result.lat).eq(0.005);
            expect(result.lng).eq(0.005);
        });

        /**
         * GIVEN: A coordinate at mid-latitude (45°)
         * WHEN: position is 'south-west'
         * THEN: Should return the south-west corner with latitude-specific longitude scale
         */
        it('should return south-west corner at mid-latitude (45°)', () => {
            const cartesianTools = new CartesianTools(0.01);
            const input = new LatLng({lat: 45.005, lng: 45.005});

            const result = cartesianTools.getLatLngFromEarthMap(input, {
                position: CartesianPixelPosition.SW,
            });

            // At 45°, longitude scale is 0.014
            // Point 45.005 is in pixel [45, 45.01) for lat, [44.996, 45.01) for lng
            expect(result.lat).eq(45);
            expect(result.lng).eq(44.996);
        });

        /**
         * GIVEN: A coordinate at mid-latitude (45°)
         * WHEN: position is 'south-east'
         * THEN: Should return the south-east corner with latitude-specific longitude scale
         */
        it('should return south-east corner at mid-latitude (45°)', () => {
            const cartesianTools = new CartesianTools(0.01);
            const input = new LatLng({lat: 45.005, lng: 45.005});

            const result = cartesianTools.getLatLngFromEarthMap(input, {
                position: CartesianPixelPosition.SE,
            });

            // South-east: lat = 45, lng = 44.996 + 0.014 = 45.01
            expect(result.lat).eq(45);
            expect(result.lng).eq(45.01);
        });

        /**
         * GIVEN: A coordinate at mid-latitude (45°)
         * WHEN: position is 'north-west'
         * THEN: Should return the north-west corner with latitude-specific longitude scale
         */
        it('should return north-west corner at mid-latitude (45°)', () => {
            const cartesianTools = new CartesianTools(0.01);
            const input = new LatLng({lat: 45.005, lng: 45.005});

            const result = cartesianTools.getLatLngFromEarthMap(input, {
                position: CartesianPixelPosition.NW,
            });

            // North-west: lat = 45 + 0.01 = 45.01, lng = 44.996
            expect(result.lat).eq(45.01);
            expect(result.lng).eq(44.996);
        });

        /**
         * GIVEN: A coordinate at mid-latitude (45°)
         * WHEN: position is 'north-east'
         * THEN: Should return the north-east corner with latitude-specific longitude scale
         */
        it('should return north-east corner at mid-latitude (45°)', () => {
            const cartesianTools = new CartesianTools(0.01);
            const input = new LatLng({lat: 45.005, lng: 45.005});

            const result = cartesianTools.getLatLngFromEarthMap(input, {
                position: CartesianPixelPosition.NE,
            });

            // North-east: lat = 45 + 0.01 = 45.01, lng = 44.996 + 0.014 = 45.01
            expect(result.lat).eq(45.01);
            expect(result.lng).eq(45.01);
        });

        /**
         * GIVEN: A coordinate at mid-latitude (45°)
         * WHEN: position is 'center'
         * THEN: Should return the center with latitude-specific longitude scale
         */
        it('should return center at mid-latitude (45°)', () => {
            const cartesianTools = new CartesianTools(0.01);
            const input = new LatLng({lat: 45.005, lng: 45.005});

            const result = cartesianTools.getLatLngFromEarthMap(input, {
                position: CartesianPixelPosition.C,
            });

            // Center: lat = 45 + 0.01/2 = 45.005, lng = 44.996 + 0.014/2 = 45.003
            expect(result.lat).eq(45.005);
            expect(result.lng).eq(45.003);
        });

        /**
         * GIVEN: A coordinate near the pole (85°)
         * WHEN: position is 'south-west'
         * THEN: Should return the south-west corner with large longitude scale
         */
        it('should return south-west corner near pole (85°)', () => {
            const cartesianTools = new CartesianTools(0.01);
            const input = new LatLng({lat: -85.005, lng: -177.005});

            const result = cartesianTools.getLatLngFromEarthMap(input, {
                position: CartesianPixelPosition.SW,
            });

            // At -85°, longitude scale is 0.115
            // Point -85.005 is in pixel [-85.01, -85.0), -177.005 is in pixel [-177.1, -176.985)
            expect(result.lat).eq(-85.01);
            expect(result.lng).eq(-177.1);
        });

        /**
         * GIVEN: A coordinate near the pole (85°)
         * WHEN: position is 'center'
         * THEN: Should return the center with large longitude scale
         */
        it('should return center near pole (85°)', () => {
            const cartesianTools = new CartesianTools(0.01);
            const input = new LatLng({lat: -85.005, lng: -177.005});

            const result = cartesianTools.getLatLngFromEarthMap(input, {
                position: CartesianPixelPosition.C,
            });

            // Center: lat = -85.01 + 0.01/2 = -85.005, lng = -177.1 + 0.115/2 = -177.0425
            expect(result.lat).eq(-85.005);
            expect(result.lng).eq(-177.0425);
        });

        /**
         * GIVEN: A coordinate near the pole (85°)
         * WHEN: position is 'north-east'
         * THEN: Should return the north-east corner with large longitude scale
         */
        it('should return north-east corner near pole (85°)', () => {
            const cartesianTools = new CartesianTools(0.01);
            const input = new LatLng({lat: -85.005, lng: -177.005});

            const result = cartesianTools.getLatLngFromEarthMap(input, {
                position: CartesianPixelPosition.NE,
            });

            // North-east: lat = -85.01 + 0.01 = -85.0, lng = -177.1 + 0.115 = -176.985
            expect(result.lat).eq(-85);
            expect(result.lng).eq(-176.985);
        });

        /**
         * GIVEN: Multiple coordinates in the same pixel
         * WHEN: position is 'center'
         * THEN: All should return the same center point
         */
        it('should return same center for all points within the same pixel', () => {
            const cartesianTools = new CartesianTools(0.01);

            // All these points are in pixel [12.0, 12.01) so should have same center
            const inputs = [
                new LatLng({lat: 12.001, lng: 12.001}),
                new LatLng({lat: 12.005, lng: 12.005}),
                new LatLng({lat: 12.009, lng: 12.008}),
            ];

            const results = inputs.map((input) =>
                cartesianTools.getLatLngFromEarthMap(input, {position: CartesianPixelPosition.C})
            );

            // All should map to same pixel center (pixel with SW corner at 12.0)
            results.forEach((result) => {
                expect(result.lat).eq(12.005);
                expect(result.lng).eq(12.005);
            });
        });

        /**
         * GIVEN: Coordinates at the equator in different pixels
         * WHEN: position is 'center'
         * THEN: Should return different centers for different pixels
         */
        it('should return different centers for different pixels', () => {
            const cartesianTools = new CartesianTools(0.01);

            const pixel1 = new LatLng({lat: 0.005, lng: 0.005});
            const pixel2 = new LatLng({lat: 0.015, lng: 0.005});

            const center1 = cartesianTools.getLatLngFromEarthMap(pixel1, {
                position: CartesianPixelPosition.C,
            });
            const center2 = cartesianTools.getLatLngFromEarthMap(pixel2, {
                position: CartesianPixelPosition.C,
            });

            // 0.005 -> pixel [0, 0.01) with SW at 0 -> center at 0.005
            expect(center1.lat).eq(0.005);
            expect(center1.lng).eq(0.005);

            // 0.015 -> pixel [0.01, 0.02) with SW at 0.01 -> center at 0.015
            expect(center2.lat).eq(0.015);
            expect(center2.lng).eq(0.005);

            // Centers should be different
            expect(center1.lat).not.eq(center2.lat);
        });

        /**
         * GIVEN: Coordinates crossing the international date line
         * WHEN: position is 'south-east'
         * THEN: Should handle longitude wrapping correctly
         */
        it('should handle date line crossing with south-east position', () => {
            const cartesianTools = new CartesianTools(0.01);
            const input = new LatLng({lat: 0, lng: 179.995});

            const result = cartesianTools.getLatLngFromEarthMap(input, {
                position: CartesianPixelPosition.SE,
            });

            // 179.995 -> pixel with SW at 179.99, SE = 179.99 + 0.01 = 180.0
            expect(result.lat).eq(0.0);
            expect(result.lng).eq(180);
        });

        /**
         * GIVEN: Negative coordinates (southern/western hemispheres)
         * WHEN: position is 'center'
         * THEN: Should handle negative coordinates correctly
         */
        it('should handle negative coordinates with center position', () => {
            const cartesianTools = new CartesianTools(0.01);
            const input = new LatLng({lat: -34.605, lng: -58.385}); // Buenos Aires region

            const result = cartesianTools.getLatLngFromEarthMap(input, {
                position: CartesianPixelPosition.C,
            });

            // Verify center is calculated correctly for negative coordinates
            const sw = cartesianTools.getLatLngFromEarthMap(input, {
                position: CartesianPixelPosition.SW,
            });
            const ne = cartesianTools.getLatLngFromEarthMap(input, {
                position: CartesianPixelPosition.NE,
            });

            // Center should be midpoint of SW and NE (use closeTo for floating point)
            const expectedLat = (sw.lat + ne.lat) / 2;
            const expectedLng = (sw.lng + ne.lng) / 2;

            expect(result.lat).closeTo(expectedLat, 1e-10);
            expect(result.lng).closeTo(expectedLng, 1e-10);
        });

        /**
         * GIVEN: Coordinate at pixel boundary
         * WHEN: position is 'south-west'
         * THEN: Should snap to the correct pixel
         */
        it('should handle coordinates exactly on pixel boundaries', () => {
            const cartesianTools = new CartesianTools(0.01);
            const input = new LatLng({lat: 12.0, lng: 12.0}); // Exactly on boundary

            const result = cartesianTools.getLatLngFromEarthMap(input, {
                position: CartesianPixelPosition.SW,
            });

            // Should snap to the south-west corner of the pixel containing this point
            expect(result.lat).eq(12.0);
            expect(result.lng).eq(12.0);
        });

        /**
         * SPEC: Precision consistency across positions
         *
         * GIVEN: A coordinate
         * WHEN: Requesting different positions
         * THEN: All positions should maintain consistent precision (12 digits)
         */
        it('should maintain precision consistency across all position options', () => {
            const cartesianTools = new CartesianTools(0.01);
            const input = new LatLng({lat: 45.00556, lng: 45.0008});

            const positions = Object.values(CartesianPixelPosition) as CartesianPixelPosition[];

            positions.forEach((position) => {
                const result = cartesianTools.getLatLngFromEarthMap(input, {position});

                // All results should have limited precision
                // Check that the values don't have floating point artifacts
                const latString = result.lat.toString();
                const lngString = result.lng.toString();

                // Values should not have more than reasonable decimal places
                expect(latString.split('.')[1]?.length || 0).lessThan(13);
                expect(lngString.split('.')[1]?.length || 0).lessThan(13);
            });
        });

        /**
         * SPEC: Relationship between corners and center
         *
         * GIVEN: A coordinate
         * WHEN: Getting all 4 corners and center
         * THEN: Center should be the geometric mean of opposite corners
         */
        it('should have center as geometric mean of opposite corners', () => {
            const cartesianTools = new CartesianTools(0.01);
            const input = new LatLng({lat: 12.005, lng: 45.005});

            const sw = cartesianTools.getLatLngFromEarthMap(input, {
                position: CartesianPixelPosition.SW,
            });
            const ne = cartesianTools.getLatLngFromEarthMap(input, {
                position: CartesianPixelPosition.NE,
            });
            const center = cartesianTools.getLatLngFromEarthMap(input, {
                position: CartesianPixelPosition.C,
            });

            // Center should be midpoint of SW and NE diagonal (use closeTo for floating point)
            expect(center.lat).closeTo((sw.lat + ne.lat) / 2, 1e-10);
            expect(center.lng).closeTo((sw.lng + ne.lng) / 2, 1e-10);

            // Also verify with other diagonal (SE and NW)
            const se = cartesianTools.getLatLngFromEarthMap(input, {
                position: CartesianPixelPosition.SE,
            });
            const nw = cartesianTools.getLatLngFromEarthMap(input, {
                position: CartesianPixelPosition.NW,
            });

            expect(center.lat).closeTo((se.lat + nw.lat) / 2, 1e-10);
            expect(center.lng).closeTo((se.lng + nw.lng) / 2, 1e-10);
        });

        /**
         * SPEC: Invalid position handling
         *
         * GIVEN: A coordinate
         * WHEN: position is an invalid string
         * THEN: Should fall back to default 'south-west' behavior
         */
        it('should fall back to south-west for invalid position values', () => {
            const cartesianTools = new CartesianTools(0.01);
            const input = new LatLng({lat: 0.005, lng: 0.005});

            // Testing invalid position value
            const result = cartesianTools.getLatLngFromEarthMap(input, {
                position: 'invalid' as any,
            });

            // Should return same as south-west (default)
            const defaultResult = cartesianTools.getLatLngFromEarthMap(input);

            expect(result.lat).eq(defaultResult.lat);
            expect(result.lng).eq(defaultResult.lng);
        });
    });
});
