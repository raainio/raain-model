import {expect} from 'chai';
import {RadarMeasure, RadarNode, TeamNode} from '../../src';

describe('RadarMeasure', () => {
  it('should add radar link via constructor and purify to id in toJSON', () => {
    const team = new TeamNode({id: 't1', name: 't'} as any);
    const radar = new RadarNode({id: 'r1', name: 'r', latitude: 0, longitude: 0, team} as any);
    const m = new RadarMeasure({id: 'm1', values: [1,2], radar} as any);

    const json: any = m.toJSON();
    expect(json.radar).eq('r1');
  });

  it('should accept raw link-like objects in getRadarLinks', () => {
    const m = new RadarMeasure({id: 'm2', values: []} as any);
    // @ts-expect-error access protected for test purposes
    const links: any[] = m.getRadarLinks([{_id: 123, name: 'n', team: 't'}, {id: 'x', name: 'n', team: 't'}]);
    expect(links).to.have.length(2);
    expect(links[0]).to.be.instanceOf(RadarNode);
  });
});
