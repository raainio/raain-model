import {expect} from 'chai';
import {CartesianTools, EarthMap, LatLng, RainNode} from '../../src';

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
        const center = new LatLng({lat: 12.3456, lng: 1.234});

        expect(CartesianTools.IsAroundLatLng(center, new LatLng({lat: 12.3456, lng: 1.234}), 0)).eq(
            true
        );
        expect(CartesianTools.IsAroundLatLng(center, new LatLng({lat: 12.3457, lng: 1.234}), 0)).eq(
            true
        );
        expect(CartesianTools.IsAroundLatLng(center, new LatLng({lat: 12.0006, lng: 1.234}), 0)).eq(
            false
        );

        expect(
            CartesianTools.IsAroundLatLng(center, new LatLng({lat: 12.3456, lng: 1.234}), 0, 0.1)
        ).eq(true);
        expect(
            CartesianTools.IsAroundLatLng(center, new LatLng({lat: 12.3556, lng: 1.234}), 0, 0.1)
        ).eq(false);

        expect(
            CartesianTools.IsAroundLatLng(center, new LatLng({lat: 12.3456, lng: 1.234}), 1, 0.1)
        ).eq(true);
        expect(
            CartesianTools.IsAroundLatLng(center, new LatLng({lat: 12.3457, lng: 1.234}), 1, 0.1)
        ).eq(true);
        expect(
            CartesianTools.IsAroundLatLng(center, new LatLng({lat: 12.3457, lng: 1.434}), 1, 0.1)
        ).eq(false);

        expect(
            CartesianTools.IsAroundLatLng(center, new LatLng({lat: 12.3456, lng: 1.234}), 6, 0.01)
        ).eq(true);
        expect(
            CartesianTools.IsAroundLatLng(center, new LatLng({lat: 12.3456, lng: 1.299}), 6, 0.01)
        ).eq(false);
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

    it('should buildLatLngEarthMap', () => {
        const cartesianTools = new CartesianTools(CartesianTools.DEFAULT_SCALE);

        // useless
        // const earthMap = cartesianTools.buildLatLngEarthMap();
        // replaced by singleton
        const earthMap = EarthMap.getInstance();

        expect(
            cartesianTools.getLatLngFromEarthMap(new LatLng({lat: 12.00656, lng: 12.0098})).lat
        ).eq(12.01);

        expect(earthMap.latitudeScale).eq(CartesianTools.DEFAULT_SCALE);
        expect(earthMap.latitudes.length).eq(18001);
        expect(earthMap.latitudeLongitudeScales.length).eq(18001);

        expect(earthMap.latitudes[0]).eq(-90);
        expect(earthMap.latitudes[9000]).eq(0);
        expect(earthMap.latitudes[18000]).eq(90);
        expect(earthMap.latitudeLongitudeScales[0]).eq(1);
        expect(earthMap.latitudeLongitudeScales[9000]).eq(CartesianTools.DEFAULT_SCALE);
        expect(earthMap.latitudeLongitudeScales[18000]).eq(1);

        expect(cartesianTools.getScaleLatLng(new LatLng({lat: 0, lng: 0})).lat).eq(0.01);
        expect(cartesianTools.getScaleLatLng(new LatLng({lat: 0, lng: 0})).lng).eq(0.01);
        expect(cartesianTools.getScaleLatLng(new LatLng({lat: 12.00556, lng: 12.0098})).lat).eq(
            0.01
        );
        expect(cartesianTools.getScaleLatLng(new LatLng({lat: 12.00556, lng: 12.0098})).lng).eq(
            0.01
        );
        expect(cartesianTools.getScaleLatLng(new LatLng({lat: 45.00556, lng: 45.0008})).lat).eq(
            0.01
        );
        expect(cartesianTools.getScaleLatLng(new LatLng({lat: 45.00556, lng: 45.0008})).lng).eq(
            0.014
        );
        expect(cartesianTools.getScaleLatLng(new LatLng({lat: -85.00556, lng: -177.0098})).lat).eq(
            0.01
        );
        expect(cartesianTools.getScaleLatLng(new LatLng({lat: -85.00656, lng: -177.0098})).lng).eq(
            0.115
        );

        expect(
            cartesianTools.getScaleLatLngFromEarth(new LatLng({lat: -85.00556, lng: -177.0098})).lat
        ).eq(0.01);
        expect(
            cartesianTools.getScaleLatLngFromEarth(new LatLng({lat: -85.00656, lng: -177.0098})).lng
        ).eq(0.115);

        expect(cartesianTools.getLatLngFromEarthMap(new LatLng({lat: 0, lng: 0})).lat).eq(0);
        expect(cartesianTools.getLatLngFromEarthMap(new LatLng({lat: 0, lng: 0})).lng).eq(0);
        expect(
            cartesianTools.getLatLngFromEarthMap(new LatLng({lat: 12.00556, lng: 12.0098})).lat
        ).eq(12.01);
        expect(
            cartesianTools.getLatLngFromEarthMap(new LatLng({lat: 12.00656, lng: 12.0098})).lng
        ).eq(12.01);
        expect(
            cartesianTools.getLatLngFromEarthMap(new LatLng({lat: 45.00556, lng: 45.0008})).lat
        ).eq(45.01);
        expect(
            cartesianTools.getLatLngFromEarthMap(new LatLng({lat: 45.00556, lng: 45.0008})).lng
        ).eq(44.996);
        expect(
            cartesianTools.getLatLngFromEarthMap(new LatLng({lat: -85.00556, lng: -177.0098})).lat
        ).eq(-85.01);
        expect(
            cartesianTools.getLatLngFromEarthMap(new LatLng({lat: -85.00656, lng: -177.0098})).lng
        ).eq(-176.985);
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
            '[[{"lat":49.95,"lng":3.615},{"lat":52.19,"lng":7.184}]]'
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
});
