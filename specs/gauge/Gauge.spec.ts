import {expect} from 'chai';
import {GaugeMeasure, GaugeNode, GaugeNodeMap, TeamNode} from '../../src';

describe('Gauge', () => {

    it('should create ones', () => {

        const team1 = new TeamNode({
            id: 'tid1',
            name: 'team1',
            description: 'team...',
            contracts: ['basic'],
            contacts: []
        });

        const gaugeNode = new GaugeNode({
            id: 'Node looks OK.', name: 'name', links: [],
            latitude: 1, longitude: 1,
            team: team1
        });
        expect(gaugeNode.id).eq('Node looks OK.');
        expect(JSON.stringify(gaugeNode.toJSON())).eq('{"id":"Node looks OK.","links":[],"name":"name","latitude":1,"longitude":1,"team":"tid1"}');

        const measureConf = {
            rainId: 'rainId',
            type: 'type',
            trust: true,
            gaugeId: 'test',
            angle: 12,
            speed: 10,
        };

        const gaugeMeasure = new GaugeMeasure({id: 'measure', values: [10, 11], configurationAsJSON: JSON.stringify(measureConf)});
        expect(JSON.stringify(gaugeMeasure.toJSON())).eq('{"id":"measure","links":[],"validity":-1,"configurationAsJSON":"{\\"rainId\\":\\"rainId\\",\\"type\\":\\"type\\",\\"trust\\":true,\\"gaugeId\\":\\"test\\",\\"angle\\":12,\\"speed\\":10}","values":[10,11]}');
        expect(gaugeMeasure.getConfiguration().trust).eq(true);

        const json = gaugeNode.toJSON();
        const gaugeNodeMap = new GaugeNodeMap({...json});
        gaugeNodeMap.setMapData([gaugeMeasure]);
        const mappedMeasures = gaugeNodeMap.getMapData();
        expect(mappedMeasures.length).eq(1);
        const values = (mappedMeasures[0].values as number[]);
        expect(values.length).eq(2);


    });

});
