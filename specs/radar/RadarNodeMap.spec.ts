import {expect} from 'chai';
import {RadarMeasure, RadarNodeMap, TeamNode} from '../../src';

describe('RadarNodeMap', () => {
    const team = new TeamNode({id: 't1', name: 'team'} as any);

    const sampleMeasures = [
        new RadarMeasure({id: 'm1', values: [1, 2, 3]} as any),
        new RadarMeasure({id: 'm2', values: [4, 5]} as any),
    ];

    it('should stringify map array and restore RadarMeasure instances', () => {
        const node = new RadarNodeMap({
            id: 'rid',
            name: 'rname',
            latitude: 10,
            longitude: 20,
            team,
            date: new Date('2020-01-01T00:00:00Z'),
            map: sampleMeasures,
            description: 'd',
        } as any);

        // toJSON should include stringified map
        const json: any = node.toJSON();
        expect(json.date).to.be.instanceOf(Date);
        expect(typeof json.map).eq('string');

        // getMapData should parse and build measures
        const restored = node.getMapData();
        expect(restored).to.have.length(2);
        expect(restored[0]).to.be.instanceOf(RadarMeasure);
    });

    it('should accept pre-stringified map and handle bad JSON gracefully', () => {
        const node = new RadarNodeMap({
            id: 'rid',
            name: 'r',
            latitude: 0,
            longitude: 0,
            team,
            date: new Date(),
            map: JSON.stringify([{id: 'm3', values: [7]}]),
            description: '',
        } as any);

        expect(node.getMapData()).to.have.length(1);

        // Corrupt map after construction to simulate failure
        (node as any).map = '{bad json}';
        expect(node.getMapData()).to.deep.equal([]);
    });
});
