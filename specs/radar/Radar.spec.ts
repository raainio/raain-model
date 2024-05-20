import {expect} from 'chai';
import {PolarMeasureValue, RadarMeasure, RadarNode, RadarPolarMeasureValue} from '../../src';

describe('Radar', () => {

    it('should create ones', () => {

        const radarNode = new RadarNode({
            id: 'RadarNode looks OK.', name: 'name', links: [], latitude: 1, longitude: 1
        });
        expect(radarNode.id).eq('RadarNode looks OK.');
        expect(JSON.stringify(radarNode.toJSON())).eq('{"id":"RadarNode looks OK.","links":[],"name":"name","latitude":1,"longitude":1}');

        const polarMeasureValues = [new PolarMeasureValue({measureValuePolarContainers: []})];
        const measure = new RadarMeasure({id: 'measure', values: polarMeasureValues});
        expect(JSON.stringify(measure.toJSON())).eq('{"id":"measure","links":[],"validity":-1,"values":[{"polars":[]}]}');

        const polarMeasureValue = measure.values[0] as PolarMeasureValue;
        const radarPolarMeasureValue = new RadarPolarMeasureValue({polars: polarMeasureValue});
        expect(JSON.stringify(radarPolarMeasureValue.toJSON())).eq('{"polars":{"polars":[]}}');
    });

});
