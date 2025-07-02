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
        });
        expect(rainNode.getCenter().lat).eq(0);
        expect(rainNode.getCenter().lng).eq(0);
        expect(rainNode.latLngRectsAsJSON).eq('[[{"lat":1,"lng":-1},{"lat":-1,"lng":1}]]');
        cartesianTools.adjustRainNodeWithSquareWidth(rainNode, 300);

        expect(rainNode.latLngRectsAsJSON).eq(
            '[{"lat":-1.35,"lng":-1.35},{"lat":1.35,"lng":1.35}]'
        );
    });
});
