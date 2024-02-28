import {expect} from 'chai';
import {LatLng, Position, QualityTools} from '../../src';

describe('QualityTools', () => {

    it('should get roundLatLng', () => {
        expect(QualityTools.RoundLatLng(12.1234)).eq(12.120000000000001);
        expect(QualityTools.RoundLatLng(12.1234, 0.005)).eq(12.125);
        expect(QualityTools.RoundLatLng(12.1234, 0.001)).eq(12.123000000000001); // => needPrecision
        expect(QualityTools.RoundLatLng(12.1234, 0.001, true)).eq(12.123);
        expect(QualityTools.RoundLatLng(12.1234, 0.01, true)).eq(12.12);
        expect(QualityTools.RoundLatLng(12.1234, 0.1, true)).eq(12.1);
        expect(QualityTools.RoundLatLng(12.1234, 1)).eq(12);

        expect(QualityTools.RoundLatLng(-2.8000000000000003, 0.1, true)).eq(-2.8);
        expect(QualityTools.RoundLatLng(-2.8000000000000003, 0.002, true)).eq(-2.8);

        expect(QualityTools.RoundLatLng(-23.8000000000000003, 10)).eq(-20);
        expect(QualityTools.RoundLatLng(345.1200000000000003, 200)).eq(400);
    });

    it('should isAroundLatLng', () => {
        const center = new LatLng({lat: 12.3456, lng: 1.234});

        expect(QualityTools.IsAroundLatLng(center, new LatLng({lat: 12.3456, lng: 1.234}), 0)).eq(true);
        expect(QualityTools.IsAroundLatLng(center, new LatLng({lat: 12.3457, lng: 1.234}), 0)).eq(true);
        expect(QualityTools.IsAroundLatLng(center, new LatLng({lat: 12.0006, lng: 1.234}), 0)).eq(false);

        expect(QualityTools.IsAroundLatLng(center, new LatLng({lat: 12.3456, lng: 1.234}), 0, 0.1)).eq(true);
        expect(QualityTools.IsAroundLatLng(center, new LatLng({lat: 12.3556, lng: 1.234}), 0, 0.1)).eq(false);

        expect(QualityTools.IsAroundLatLng(center, new LatLng({lat: 12.3456, lng: 1.234}), 1, 0.1)).eq(true);
        expect(QualityTools.IsAroundLatLng(center, new LatLng({lat: 12.3457, lng: 1.234}), 1, 0.1)).eq(true);
        expect(QualityTools.IsAroundLatLng(center, new LatLng({lat: 12.3457, lng: 1.434}), 1, 0.1)).eq(false);

        expect(QualityTools.IsAroundLatLng(center, new LatLng({lat: 12.3456, lng: 1.234}), 6, 0.01)).eq(true);
        expect(QualityTools.IsAroundLatLng(center, new LatLng({lat: 12.3456, lng: 1.299}), 6, 0.01)).eq(false);
    });

    it('should isNotAroundLatLng', () => {
        const center = new LatLng({lat: 12.3456, lng: 1.234});

        expect(QualityTools.IsNotAroundLatLng(center, new LatLng({lat: 12.3456, lng: 1.234}), 0)).eq(false);
        expect(QualityTools.IsNotAroundLatLng(center, new LatLng({lat: 12.3457, lng: 1.234}), 0)).eq(false);
        expect(QualityTools.IsNotAroundLatLng(center, new LatLng({lat: 12.0006, lng: 1.234}), 0)).eq(true);

        expect(QualityTools.IsNotAroundLatLng(center, new LatLng({lat: 12.3456, lng: 1.234}), 0, 0.1)).eq(false);
        expect(QualityTools.IsNotAroundLatLng(center, new LatLng({lat: 12.3556, lng: 1.234}), 0, 0.1)).eq(true);

        expect(QualityTools.IsNotAroundLatLng(center, new LatLng({lat: 12.3456, lng: 1.234}), 1, 0.1)).eq(false);
        expect(QualityTools.IsNotAroundLatLng(center, new LatLng({lat: 12.3457, lng: 1.234}), 1, 0.1)).eq(false);
        expect(QualityTools.IsNotAroundLatLng(center, new LatLng({lat: 12.3457, lng: 1.434}), 1, 0.1)).eq(true);

        expect(QualityTools.IsNotAroundLatLng(center, new LatLng({lat: 12.3456, lng: 1.234}), 6, 0.01)).eq(false);
        expect(QualityTools.IsNotAroundLatLng(center, new LatLng({lat: 12.3456, lng: 1.299}), 6, 0.01)).eq(true);
    });


    it('should MapPositionToLatLng and MapLatLngToPosition', () => {

        let point = new Position({x: 0, y: 0});
        let latLng = QualityTools.MapPositionToLatLng(point);
        expect(QualityTools.MapLatLngToPosition(latLng).x).eq(point.x);
        expect(QualityTools.MapLatLngToPosition(latLng).y).eq(point.y);
        expect(latLng.lat).eq(0);
        expect(latLng.lng).eq(0);

        point = new Position({x: 10, y: -10});
        latLng = QualityTools.MapPositionToLatLng(point);
        expect(QualityTools.MapLatLngToPosition(latLng).x).eq(point.x);
        expect(QualityTools.MapLatLngToPosition(latLng).y).eq(point.y);
        expect(latLng.lat).eq(-10);
        expect(latLng.lng).eq(10);

        point = new Position({x: 11.0003, y: -11.03});
        latLng = QualityTools.MapPositionToLatLng(point);
        expect(QualityTools.MapLatLngToPosition(latLng).x).eq(point.x);
        expect(QualityTools.MapLatLngToPosition(latLng).y).eq(point.y);

        point = new Position({x: 11.0003, y: -11.03});
        const cartesianWidthDefault = new LatLng({lat: QualityTools.DEFAULT_SCALE, lng: QualityTools.DEFAULT_SCALE});
        latLng = QualityTools.MapPositionToLatLng(point);
        expect(QualityTools.MapLatLngToPosition(latLng, true, cartesianWidthDefault).x).eq(11);
        expect(QualityTools.MapLatLngToPosition(latLng, true, cartesianWidthDefault).y).eq(-11.03);

        const cartesianWidth = new LatLng({lat: 0.01426, lng: 0.00898});
        expect(QualityTools.MapLatLngToPosition(latLng, true, cartesianWidth).y).eq(-11.02298);
        expect(QualityTools.MapLatLngToPosition(latLng, true, cartesianWidth).x).eq(11.0005);

        latLng = new LatLng({lat: 48.86420972077865, lng: 2.2681507839189115});
        expect(QualityTools.MapLatLngToPosition(latLng, true, cartesianWidth).x).eq(2.27194);
        expect(QualityTools.MapLatLngToPosition(latLng, true, cartesianWidth).y).eq(48.86902);
        latLng = new LatLng({lat: 48.86423959124331, lng: 2.254480156320581});
        expect(QualityTools.MapLatLngToPosition(latLng, true, cartesianWidth).x).eq(2.25398);
        expect(QualityTools.MapLatLngToPosition(latLng, true, cartesianWidth).y).eq(48.86902);

    });

    it('should CreateNDimArray', () => {
        const createdEmptyNDimArray = QualityTools.CreateNDimArray([1, 2, 3]);
        expect(createdEmptyNDimArray.length).eq(1);
        expect(createdEmptyNDimArray[0].length).eq(2);
        expect(createdEmptyNDimArray[0][1].length).eq(3);
        expect(createdEmptyNDimArray[0][1][2]).eq(undefined);

        const createdFilledNDimArray = QualityTools.CreateNDimArray([1, 2, 3], 4321);
        expect(createdFilledNDimArray.length).eq(1);
        expect(createdFilledNDimArray[0].length).eq(2);
        expect(createdFilledNDimArray[0][1].length).eq(3);
        expect(createdFilledNDimArray[0][1][2]).eq(4321);

        const createdFilledWithZeroNDimArray = QualityTools.CreateNDimArray([1, 2, 3], 0);
        expect(createdFilledWithZeroNDimArray[0][1][2]).eq(0);

        const createdFilledWithAnyNDimArray = QualityTools.CreateNDimArray([1, 2, 3], []);
        createdFilledWithAnyNDimArray[0][1][2].push('test');
        expect(createdFilledWithAnyNDimArray[0][1][2][0]).eq('test');
    });

});
