import {expect} from 'chai';
import {GaugeMeasure, GaugeNode, TeamNode} from '../../src';

describe('GaugeMeasure', () => {
  it('should add gauge link via constructor and purify id in toJSON', () => {
    const team = new TeamNode({id: 't1', name: 't'} as any);
    const gauge = new GaugeNode({id: 'g1', name: 'g', latitude: 0, longitude: 0, team} as any);
    const m = new GaugeMeasure({id: 'm1', values: [1,2], gauge} as any);
    const json: any = m.toJSON();
    expect(json.gauge).eq('g1');
  });

  it('should accept raw link-like objects in getGaugeLinks', () => {
    const m = new GaugeMeasure({id: 'm2', values: []} as any);
    // @ts-expect-error test protected method
    const links: any[] = m.getGaugeLinks([{_id: 123, name: 'n', team: 't'}, {id: 'x', name: 'n', team: 't'}]);
    expect(links).to.have.length(2);
    expect(links[0]).to.be.instanceOf(GaugeNode);
  });
});
