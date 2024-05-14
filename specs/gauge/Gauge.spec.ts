import {expect} from 'chai';
import {GaugeMeasure, GaugeMeasureConfiguration, GaugeNode} from '../../src';

describe('Gauge', () => {

    it('should create ones', () => {

        const gaugeNode = new GaugeNode({
            id: 'Node looks OK.', name: 'name', links: [], latitude: 1, longitude: 1
        });
        expect(gaugeNode.id).eq('Node looks OK.');
        expect(JSON.stringify(gaugeNode.toJSON())).eq('{"id":"Node looks OK.","links":[],"latitude":1,"longitude":1,"name":"name"}');

        const measureConf = new GaugeMeasureConfiguration({
            gaugeId: 'test',
            rainId: 'rainId',
            type: 'type',
            angle: 12,
            speed: 10,
            trust: true
        });

        const gaugeMeasure = new GaugeMeasure({id: 'measure', values: [10, 11], configurationAsJSON: measureConf});
        expect(JSON.stringify(gaugeMeasure.toJSON())).eq('{"id":"measure","links":[],"validity":-1,"configurationAsJSON":"{\\"rainId\\":\\"rainId\\",\\"type\\":\\"type\\",\\"trust\\":true,\\"gaugeId\\":\\"test\\",\\"angle\\":12,\\"speed\\":10}","values":[10,11],"timeInSec":-1}');

    });

});
