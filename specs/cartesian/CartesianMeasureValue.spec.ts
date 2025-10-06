import {expect} from 'chai';
import {CartesianMeasureValue, CartesianValue} from '../../src';

describe('CartesianMeasureValue', () => {
    it('should merge duplicate lat/lng by averaging values when options.merge is true', () => {
        const values = [
            new CartesianValue({lat: 0, lng: 0, value: 1}),
            new CartesianValue({lat: 0, lng: 0, value: 3}),
            new CartesianValue({lat: 1, lng: 1, value: 10}),
            new CartesianValue({lat: 1, lng: 1, value: 20}),
            new CartesianValue({lat: 2, lng: 2, value: 5}),
        ];

        const cmv = new CartesianMeasureValue({cartesianValues: []});
        cmv.setCartesianValues(values, {merge: true});

        const merged = cmv.getCartesianValues();
        // Should have one per unique coordinate: (0,0), (1,1), (2,2)
        expect(merged.length).to.equal(3);

        const v00 = cmv.getCartesianValue({lat: 0, lng: 0});
        const v11 = cmv.getCartesianValue({lat: 1, lng: 1});
        const v22 = cmv.getCartesianValue({lat: 2, lng: 2});

        expect(v00?.value).to.equal((1 + 3) / 2);
        expect(v11?.value).to.equal((10 + 20) / 2);
        expect(v22?.value).to.equal(5);

        // Check min/max computed from merged set
        const minMax = cmv.getMinMaxValues();
        expect(minMax).to.deep.equal({min: 2, max: 15});
    });
});
