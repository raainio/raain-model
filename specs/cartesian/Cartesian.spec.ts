import {expect} from 'chai';
import {
    CartesianMeasureValue,
    CartesianValue,
    GaugeMeasure,
    GaugeNode,
    ICartesianMeasureValue,
    LatLng,
    RadarCartesianMeasureValue,
    RainCartesianMeasureValue,
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
        const cartesianValue1 = new CartesianValue({
            value: 123,
            lat: 10,
            lng: 20
        });
        const cartesianValue2 = new CartesianValue({
            value: 321,
            lat: 10.002,
            lng: 19.9998
        });
        const cartesianMeasureValue = new CartesianMeasureValue({
            cartesianValues: [cartesianValue1, cartesianValue2],
        });
        const radarCartesianMeasureValue = new RadarCartesianMeasureValue({
            cartesianValues: [cartesianValue1, cartesianValue2],
            angle: 4,
            axis: 0,
            limitPoints: undefined
        });
        expect(radarCartesianMeasureValue.angle).eq(4);
        expect(radarCartesianMeasureValue.getCartesianValues().length).eq(2);
        expect(radarCartesianMeasureValue.getLimitPoints({forceCompute: true})[0].lat).eq(10);
        expect(radarCartesianMeasureValue.getLimitPoints()[0].lng).eq(19.9998);
        expect(radarCartesianMeasureValue.getLimitPoints()[1].lat).eq(10.002);
        expect(radarCartesianMeasureValue.getLimitPoints()[1].lng).eq(20);

        const radarCartesianMeasureValue2 = new RadarCartesianMeasureValue(radarCartesianMeasureValue.toJSON());
        const radarCartesianMeasureValue3 = new RadarCartesianMeasureValue(radarCartesianMeasureValue
            .toJSONWithCartesianValuesStringified());
        expect(JSON.stringify(radarCartesianMeasureValue2.toJSON())).eq('{"cartesianValues":[{"lat":10,"lng":20,"value":123},{"lat":10.002,"lng":19.9998,"value":321}],"limitPoints":[{"lat":10,"lng":19.9998},{"lat":10.002,"lng":20}],"angle":4,"axis":0}');
        expect(JSON.stringify(radarCartesianMeasureValue3.toJSON())).eq(JSON.stringify(radarCartesianMeasureValue.toJSON()));

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

        const rainCartesianMeasureValue = new RainCartesianMeasureValue({
            cartesianValues: [cartesianValue1, cartesianValue2],
            version: '',
            limitPoints: [new LatLng({lat: 0, lng: 1}), new LatLng({lat: 12, lng: 20})]
        });
        expect(rainCartesianMeasureValue.getCartesianValues().length).eq(2);
        expect(rainCartesianMeasureValue.getLimitPoints()[0].lat).eq(0);
        expect(rainCartesianMeasureValue.getLimitPoints()[0].lng).eq(1);
        expect(rainCartesianMeasureValue.getLimitPoints()[1].lat).eq(12);
        expect(rainCartesianMeasureValue.getLimitPoints()[1].lng).eq(20);
    });

});
