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
        const cartesianWidthDefault = new LatLng({
            lat: CartesianTools.DEFAULT_SCALE,
            lng: CartesianTools.DEFAULT_SCALE,
        });
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

    it('realistic map positions then IsAroundLatLng', () => {
        const gaugeHistory = new Position({
            x: -74.81639,
            y: 40.27639,
        });
        const pixel = new Position({
            x: -74.815,
            y: 40.26,
        });
        const gaugeLatLng = QualityTools.MapPositionToLatLng(gaugeHistory);
        const pixelLatLng = QualityTools.MapPositionToLatLng(pixel);

        // pixelLatLng looks like in the 3x3 square around the gaugeLatLng
        const bOkRelativePos = CartesianTools.IsAroundLatLng(gaugeLatLng, pixelLatLng, {
            inEarthMap: true,
            stepRange: 1,
        });
        expect(bOkRelativePos).eq(true);
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

    it('should find index when pair exists', () => {
        const arr = [
            [1, 2],
            [3, 4],
            [5, 6],
        ];
        expect(QualityTools.IndexOfDualArray(arr, [1, 2])).eq(0);
        expect(QualityTools.IndexOfDualArray(arr, [3, 4])).eq(1);
        expect(QualityTools.IndexOfDualArray(arr, [5, 6])).eq(2);
    });

    it('should return -1 when pair does not exist', () => {
        const arr = [
            [1, 2],
            [3, 4],
        ];
        expect(QualityTools.IndexOfDualArray(arr, [2, 1])).eq(-1);
        expect(QualityTools.IndexOfDualArray(arr, [3, 5])).eq(-1);
        expect(QualityTools.IndexOfDualArray(arr, [0, 0])).eq(-1);
    });

    it('should handle string tuples and mixed values', () => {
        const arr: any[] = [
            ['a', 'b'],
            ['x', 'y'],
            [10, '10'],
        ];
        expect(QualityTools.IndexOfDualArray(arr, ['a', 'b'])).eq(0);
        expect(QualityTools.IndexOfDualArray(arr, ['x', 'y'])).eq(1);
        expect(QualityTools.IndexOfDualArray(arr, [10, '10'])).eq(2);
        expect(QualityTools.IndexOfDualArray(arr, ['10', 10])).eq(-1);
    });

    it('should treat deep equality by reference for third level arrays (not applicable, only compares first two)', () => {
        const arr: any[] = [
            [{id: 1}, {id: 2}],
            [{}, []],
        ];
        // It compares value[0] === itemToFind[0] etc., so references must match.
        const obj1 = {id: 1};
        const obj2 = {id: 2};
        arr[0] = [obj1, obj2];
        expect(QualityTools.IndexOfDualArray(arr, [obj1, obj2])).eq(0);
        expect(QualityTools.IndexOfDualArray(arr, [{id: 1}, {id: 2}])).eq(-1);
    });

    it('should return 0 for non-finite numbers', () => {
        expect(QualityTools.Precision(NaN)).eq(0);
        expect(QualityTools.Precision(Infinity)).eq(0);
        expect(QualityTools.Precision(-Infinity)).eq(0);
    });

    it('should return number of decimal places', () => {
        expect(QualityTools.Precision(0)).eq(0);
        expect(QualityTools.Precision(1)).eq(0);
        expect(QualityTools.Precision(1.2)).eq(1);
        expect(QualityTools.Precision(1.23)).eq(2);
        expect(QualityTools.Precision(1.2345)).eq(4);
    });
});
