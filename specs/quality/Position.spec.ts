import {expect} from 'chai';
import {Position} from '../../src';

describe('Position', () => {


    it('should getXYScaled', () => {

        const pos1 = new Position({x: 10.0001, y: 12.1});
        expect(pos1.getXYScaled(0.01).x).eq(10);
        expect(pos1.getXYScaled(0.01).y).eq(12.1);

        const pos2 = new Position({x: 10.0001, y: 12.1});
        expect(pos2.getXYScaled(0.0001).x).eq(10.0001);
        expect(pos2.getXYScaled(0.0001).y).eq(12.1);
    });

});
