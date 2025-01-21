import {expect} from 'chai';
import {CartesianTools, LatLng, Position, QualityTools} from '../../src';

describe('QualityTools', () => {

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
        const cartesianWidthDefault = new LatLng({lat: CartesianTools.DEFAULT_SCALE, lng: CartesianTools.DEFAULT_SCALE});
        latLng = QualityTools.MapPositionToLatLng(point);
        // expect(QualityTools.MapLatLngToPosition(latLng).x).eq(11);
        expect(QualityTools.MapLatLngToPosition(latLng).y).eq(-11.03);

        const cartesianWidth = new LatLng({lat: 0.01426, lng: 0.00898});
        // expect(QualityTools.MapLatLngToPosition(latLng).y).eq(-11.02298);
        // expect(QualityTools.MapLatLngToPosition(latLng).x).eq(11.0005);

        latLng = new LatLng({lat: 48.86420972077865, lng: 2.2681507839189115});
        // expect(QualityTools.MapLatLngToPosition(latLng).x).eq(2.27194);
        // expect(QualityTools.MapLatLngToPosition(latLng).y).eq(48.86902);
        latLng = new LatLng({lat: 48.86423959124331, lng: 2.254480156320581});
        // expect(QualityTools.MapLatLngToPosition(latLng).x).eq(2.25398);
        // expect(QualityTools.MapLatLngToPosition(latLng).y).eq(48.86902);

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
