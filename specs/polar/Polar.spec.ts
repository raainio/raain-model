import {expect} from 'chai';
import {MeasureValuePolarContainer, PolarMeasureValue, PolarValue} from '../../src';

describe('Polar', () => {

    it('should create ones', () => {

        const polarValue = new PolarValue({value: 12, polarAzimuthInDegrees: 2, polarDistanceInMeters: 4});
        expect(polarValue.value).eq(12);
        expect(polarValue.polarAzimuthInDegrees).eq(2);
        expect(polarValue.polarDistanceInMeters).eq(4);

        const measureValuePolarContainer = new MeasureValuePolarContainer({azimuth: 0, distance: 1, polarEdges: [33, 45.5]});
        expect(measureValuePolarContainer.polarEdges[0]).eq(33);
        expect(measureValuePolarContainer.polarEdges[1]).eq(45.5);

        const polarMeasureValue = new PolarMeasureValue({measureValuePolarContainers: [measureValuePolarContainer]});
        const polarValueFound = polarMeasureValue.getPolarValue({azimuthIndex: 0, edgeIndex: 1, strict: false});
        expect(polarValueFound.value).eq(45.5);
        expect(polarValueFound.polarAzimuthInDegrees).eq(0);
        expect(polarValueFound.polarDistanceInMeters).eq(1);

    });

});
