import {MeasureValuePolarContainer, RadarNode, RainNode} from '../dist';
// import {RadarNode, RainNode} from '../src';
import * as assert from 'assert';

console.log('### Basic model examples... ');

const radarNode = new RadarNode('RadarNode looks OK.', 'name', [], 1, 1);
assert(radarNode.id === 'RadarNode looks OK.');

const rainNode = new RainNode('RainNode looks OK.', 'name', [radarNode], 1, 1);
assert(rainNode.id === 'RainNode looks OK.');
assert(rainNode.getLinkId('radar', 0) === 'RadarNode looks OK.');

const jsMeasure = new MeasureValuePolarContainer({azimuth: 0, distance: 1, polarEdges: [33, 45.5]});
assert(jsMeasure.polarEdges[0] === 33);

console.log('### Done. ');

