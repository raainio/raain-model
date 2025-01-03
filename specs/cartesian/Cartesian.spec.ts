import {expect} from 'chai';
import {
    CartesianMeasureValue,
    CartesianValue,
    GaugeMeasure,
    GaugeNode,
    ICartesianMeasureValue,
    LatLng,
    RadarCartesianMeasureValue,
    TeamNode
} from '../../src';

describe('Cartesian', () => {

    it('should create ones', () => {

        const team1 = new TeamNode({
            id: 'tid1',
            name: 'team1',
            description: 'team...',
            contracts: ['basic'],
            contacts: []
        });
        const cartesianValue = new CartesianValue({
            value: 123,
            lat: 10,
            lng: 20
        });
        const cartesianMeasureValue = new CartesianMeasureValue({
            cartesianValues: [cartesianValue, cartesianValue],
            cartesianPixelWidth: {lat: 1.002, lng: 13.0024}
        });
        const radarCartesianMeasureValue = new RadarCartesianMeasureValue({
            cartesianValues: [cartesianValue, cartesianValue],
            cartesianPixelWidth: new LatLng({lat: 1, lng: 2}),
            angle: 4,
            axis: 0,
        });
        expect(radarCartesianMeasureValue.angle).eq(4);
        expect(radarCartesianMeasureValue.getCartesianValues().length).eq(2);
        expect(radarCartesianMeasureValue.getCartesianPixelWidth().lng).eq(2);

        const gaugeNode = new GaugeNode({
            id: 'GaugeNode looks OK.',
            name: 'name',
            links: [],
            latitude: 1,
            longitude: 1,
            team: team1,
        });
        expect(gaugeNode.id).eq('GaugeNode looks OK.');

        const gaugeMeasure = new GaugeMeasure({
            id: 'gaugeMeasure',
            date: new Date(),
            values: [cartesianMeasureValue],
            validity: 1
        });
        expect((gaugeMeasure.values[0] as ICartesianMeasureValue).getCartesianValue({lat: 10, lng: 20}).value).eq(123);
        expect((gaugeMeasure.values[0] as ICartesianMeasureValue).getCartesianValue({lat: 10.0001, lng: 20.00001})).eq(null);

    });

});
