import {expect} from 'chai';
import {RadarMeasure, RadarNode} from '../../src';

describe('Radar', () => {

    it('should create ones', () => {

        const radarNode = new RadarNode({
            id: 'RadarNode looks OK.', name: 'name', links: [], latitude: 1, longitude: 1
        });
        expect(radarNode.id).eq('RadarNode looks OK.');
        expect(JSON.stringify(radarNode.toJSON())).eq('{"id":"RadarNode looks OK.","links":[],"name":"name","latitude":1,"longitude":1}');

        const measure = new RadarMeasure({id: 'measure', values: [10, 11]});
        expect(JSON.stringify(measure.toJSON())).eq('{"id":"measure","links":[],"validity":-1,"values":[10,11]}');
    });

});
