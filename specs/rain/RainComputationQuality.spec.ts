import {expect} from 'chai';
import {RainComputationQuality, RainComputation, SpeedMatrixContainer, Link} from '../../src';

describe('RainComputationQuality', () => {
  const base = {
    id: 'rcq1',
    date: new Date('2020-01-01T00:00:00Z'),
    isReady: true,
    qualitySpeedMatrixContainer: new SpeedMatrixContainer({matrices: []} as any),
  } as any;

  it('should add rainComputation link from id/_id and toJSON returns id', () => {
    const fromId = new RainComputationQuality({...base, rainComputation: {id: 'rid', date: new Date(), version: 'v'} as any});
    const fromMongo = new RainComputationQuality({...base, rainComputation: {_id: 'mid', date: new Date(), version: 'v'} as any});
    const json1: any = fromId.toJSON();
    const json2: any = fromMongo.toJSON();
    expect(json1.rainComputation).eq('rid');
    expect(json2.rainComputation).eq('mid');
  });

  it('should handle Link instance and missing links', () => {
    const link = new Link(RainComputation.TYPE, 'x');
    const fromLink = new RainComputationQuality({...base, rainComputation: link});
    const json: any = fromLink.toJSON();
    expect(json.rainComputation).eq('x');

    const none = new RainComputationQuality({...base});
    const jsonNone: any = none.toJSON();
    expect(jsonNone.rainComputation).eq('');
  });

  it('should merge value fields and qualitySpeedMatrixContainer via merge', () => {
    const a = new RainComputationQuality({...base, quality: 0.5, progressIngest: 60, progressComputing: 80, timeSpentInMs: 10});
    const b = new RainComputationQuality({...base, date: new Date('2020-01-02T00:00:00Z'), quality: 1, progressIngest: 40, progressComputing: 20, timeSpentInMs: 15});
    // spy merge
    const mergedContainer = new SpeedMatrixContainer({matrices: []} as any);
    (a.qualitySpeedMatrixContainer as any).merge = () => mergedContainer;
    a.merge(b);
    expect(a.quality).eq((0.5 + 1)/2);
    expect(a.progressIngest).eq(40);
    expect(a.progressComputing).eq(20);
    expect(a.timeSpentInMs).eq(25);
    expect(a.date.toISOString()).eq(new Date('2020-01-01T00:00:00Z').toISOString());
    expect(a.qualitySpeedMatrixContainer).eq(mergedContainer);
  });
});
