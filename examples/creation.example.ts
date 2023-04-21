import {
    PeopleNode,
    TeamNode,
    MeasureValuePolarContainer,
    RadarNode,
    RainComputationNode,
    RainPolarMeasureValue,
    RainNode,
    RaainNode,
    PolarMeasureValue,
    PolarValue,
    RadarPolarMeasureValue,
    CartesianMeasureValue,
    CartesianValue,
    EventNode, GaugeMeasure, GaugeNode, RainComputationQuality} from '../dist';
import * as assert from 'assert';
import {RadarCartesianMeasureValue} from '../src/cartesians/RadarCartesianMeasureValue';

console.log('### Basic model examples... ');

// Organizations
const user1 = new PeopleNode('uid1', 'user', 'user1@null.com', 'user1', 'extra info...');
const team1 = new TeamNode('tid1', 'team1', 'team...', ['basic'], [user1]);
assert(team1.contacts[0].email === 'user1@null.com');
assert(team1.contracts[0] === 'basic');
const eventNode = new EventNode('event1', 'EventNode looks OK.', 0, false, 'need help on...', new Date(), new Date());
assert(eventNode.title === 'EventNode looks OK.');

// Polar values
/*
const _buildPolarMeasures = () => {
    const values = [];
    for (let angle = 0.4; angle < 3; angle++) {
        // let value = { angle: angle };
        const polars = [];
        for (let azimuth = 0; azimuth < 360; azimuth += 0.5) {
            let data = [];
            for (let distance = 0; distance < 250; distance++) {
                const num = azimuth * distance * (56 / (360 * 250));
                data.push(num);
            }
            const polar = {
                azimuth: azimuth,
                distance: 1,
                polarEdges: data,
            };
            polars.push(polar);
        }
        value.polars = polars;
        values.push(value);
    }
    return values;
};
*/
const polarValue = new PolarValue(12,2,4);
assert(polarValue.value === 12);
assert(polarValue.polarAzimuthInDegrees === 2);
assert(polarValue.polarDistanceInMeters === 4);

const measureValuePolarContainer = new MeasureValuePolarContainer({azimuth: 0, distance: 1, polarEdges: [33, 45.5]});
assert(measureValuePolarContainer.polarEdges[0] === 33);
assert(measureValuePolarContainer.polarEdges[1] === 45.5);

const polarMeasureValue = new PolarMeasureValue([measureValuePolarContainer]);
const polarValueFound = polarMeasureValue.getPolarValue(0,1);
assert(polarValueFound.value === 45.5);
assert(polarValueFound.polarAzimuthInDegrees === 0);
assert(polarValueFound.polarDistanceInMeters === 1);

// Cartesian values

const cartesianValue = new CartesianValue(123, 10,20);
const cartesianMeasureValue = new CartesianMeasureValue([cartesianValue, cartesianValue]);
const radarCartesianMeasureValue = new RadarCartesianMeasureValue(4,[cartesianValue, cartesianValue]);
assert(radarCartesianMeasureValue.angle === 4);
assert(radarCartesianMeasureValue.getCartesianValues().length === 2);

// Gauges
const gaugeNode = new GaugeNode('GaugeNode looks OK.', 'name', [], 1, 1);
assert(gaugeNode.id === 'GaugeNode looks OK.');
const gaugeMeasure = new GaugeMeasure('gaugeMeasure', new Date(), [cartesianMeasureValue], 1);

// Radars

const radarNode = new RadarNode('RadarNode looks OK.', 'name', [], 1, 1);
assert(radarNode.id === 'RadarNode looks OK.');

// Rains
const rainNode = new RainNode('RainNode looks OK.', 'name', [radarNode, null], 1, 1);
assert(rainNode.id === 'RainNode looks OK.');

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
    [new RainPolarMeasureValue({id: 'emptyValue'})],
    'oneUser',
    'v1',
);

assert(rainComputationNode.id === 'RainComputationNode looks OK.');
assert(rainComputationNode.getVersion() === 'v1');

const rainComputationQuality = new RainComputationQuality('RainComputationQuality looks OK.',
    new Date(), new Date(),
    [radarNode],
    1,
    100,
    'v1'
    );
assert(rainComputationQuality.id === 'RainComputationQuality looks OK.');
assert(rainComputationQuality.getVersion() === 'v1');

// Links
assert(rainNode.getLinkId('radar') === 'RadarNode looks OK.');
assert(rainComputationNode.getLinkId('radar', 0) === 'RadarNode looks OK.');
assert(rainComputationNode.getLinksCount() === 1);
assert(rainComputationNode.getLinksCount(RadarNode.TYPE) === 1);


console.log('### Done. ');