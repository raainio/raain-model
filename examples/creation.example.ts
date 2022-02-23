// @ts-ignore
import {Link, MeasureValuePolarContainer, RadarNode, RainComputationNode, RainMeasureValue, RainNode} from '../dist';
import * as assert from 'assert';

console.log('### Basic model examples... ');

const radarNode = new RadarNode('RadarNode looks OK.', 'name', [], 1, 1);
assert(radarNode.id === 'RadarNode looks OK.');

const rainNode = new RainNode('RainNode looks OK.', 'name', [radarNode, null], 1, 1);
assert(rainNode.id === 'RainNode looks OK.');
assert(rainNode.getLinkId('radar') === 'RadarNode looks OK.');

const jsMeasure = new MeasureValuePolarContainer({azimuth: 0, distance: 1, polarEdges: [33, 45.5]});
assert(jsMeasure.polarEdges[0] === 33);

const rainComputationNode = new RainComputationNode(
    'RainComputationNode looks OK.',
    new Date('2022-01-01'),
    new Date('2022-01-02'),
    [radarNode, radarNode, null],
    1,
    1,
    1,
    100,
    true,
    new Date(),
    [new RainMeasureValue({id: 'emptyValue'})],
    'oneUser',
    'v1',
);

assert(rainComputationNode.id === 'RainComputationNode looks OK.');
assert(rainComputationNode.getVersion() === 'v1');
assert(rainComputationNode.getLinksCount() === 1);
assert(rainComputationNode.getLinksCount(RadarNode.TYPE) === 1);
assert(rainComputationNode.getLinkId('radar', 0) === 'RadarNode looks OK.');

console.log('### Done. ');

