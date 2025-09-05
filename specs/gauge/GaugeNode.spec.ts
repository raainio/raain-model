import {expect} from 'chai';
import {GaugeNode, TeamNode} from '../../src';

describe('GaugeNode', () => {
    it('should set and get configuration and team id in toJSON', () => {
        const node = new GaugeNode({
            id: 'g1',
            name: 'g',
            latitude: 1,
            longitude: 2,
            team: new TeamNode({id: 't1'} as any),
        } as any);
        node.setConfiguration({a: 1});
        const conf = node.getConfiguration();
        expect(conf).to.deep.equal({a: 1});
        const json: any = node.toJSON();
        expect(json.team).eq('t1');
    });

    it('should accept team as id string and ignore bad config', () => {
        const node = new GaugeNode({
            id: 'g2',
            name: 'g',
            latitude: 0,
            longitude: 0,
            team: 't2',
            configurationAsJSON: '{bad}',
        } as any);
        // getConfiguration should return null if unparsable
        expect(node.getConfiguration()).eq(null);
        const json: any = node.toJSON();
        expect(json.team).eq('t2');
    });
});
