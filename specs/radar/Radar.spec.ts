import {expect} from 'chai';
import {RadarNode} from '../../src';

describe('Radar', () => {

    it('should create ones', () => {

        const radarNode = new RadarNode({
            id: 'RadarNode looks OK.', name: 'name', links: [], latitude: 1, longitude: 1
        });
        expect(radarNode.id).eq('RadarNode looks OK.');
    });

});
