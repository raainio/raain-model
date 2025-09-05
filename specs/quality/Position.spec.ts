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
    it('should set precision, uniq and samePosition', () => {
        const p = new Position({x: 1.23456, y: 7.89012});
        // setPrecision rounds internal x,y
        p.setPrecision(2);
        expect(p.x).eq(1.23);
        expect(p.y).eq(7.89);

        const a = [
            new Position({x: 1, y: 1}),
            new Position({x: 1, y: 1}),
            new Position({x: 2, y: 2}),
        ];
        const uniq = Position.uniq(a);
        expect(uniq).to.have.length(2);

        const p1 = new Position({x: 10.1234, y: 20.5678});
        const p2 = new Position({x: 10.12, y: 20.57});
        expect(p1.samePosition(p2, 2)).eq(true);
        expect(p1.samePosition(p2, 3)).eq(false);
    });
});
