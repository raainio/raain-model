import {expect} from 'chai';
import {
    RadarNode,
    RainComputation,
    RainComputationQuality,
    RainMeasure,
    RainNode,
    RainPolarMeasureValue,
    SpeedMatrixContainer
} from '../../src';

describe('Rain', () => {

    it('should create ones', () => {

        const radarNode = new RadarNode({id: 'any', latitude: 1, longitude: 1, name: 'any name'});
        const rainComputationEmpty = new RainComputation({id: 'any', periodBegin: null, periodEnd: null, isReady: null, results: null});

        const rainNode = new RainNode({
            id: 'RainNode looks OK.',
            name: 'name',
            links: [radarNode, rainComputationEmpty, null],
            latitude: 1,
            longitude: 1
        });
        expect(rainNode.id).eq('RainNode looks OK.');
        expect(JSON.stringify(rainNode.toJSON())).eq('' +
            '{"id":"RainNode looks OK.",' +
            '"links":[{"rel":"radar","href":"../radars/any"},{"rel":"rain-computation","href":"../rain-computations/any"},{"rel":"gauge","href":"../gauges/any"}],' +
            '"name":"name","status":-1,"quality":-1,"latitude":1,"longitude":1}');

        const rainComputation = new RainComputation({
            id: 'RainComputation looks OK.',
            periodBegin: new Date('2022-01-01'),
            periodEnd: new Date('2022-01-02'),
            links: [radarNode, radarNode, null],
            quality: 1,
            progressIngest: 1,
            progressComputing: 1,
            timeSpentInMs: 100,
            isReady: true,
            isDoneDate: new Date(),
            results: [new RainPolarMeasureValue({
                polars: '[]',
                version: 'version2'
            })],
            launchedBy: 'oneUser',
            version: 'v1',
        });

        expect(rainComputation.id).eq('RainComputation looks OK.');
        expect(rainComputation.getVersion()).eq('v1');

        const rainComputationQuality = new RainComputationQuality({
            id: 'RainComputationQuality looks OK.',
            periodBegin: new Date(),
            periodEnd: new Date(),
            links: [radarNode],
            quality: 1,
            isReady: true,
            qualitySpeedMatrixContainer: new SpeedMatrixContainer({matrices: []}),
            version: 'v1'
        });
        expect(rainComputationQuality.id).eq('RainComputationQuality looks OK.');
        expect(rainComputationQuality.getVersion()).eq('v1');

        const measure = new RainMeasure({id: 'measure', values: [10, 11], configurationAsJSON: '{"test": true}'});
        expect(JSON.stringify(measure.toJSON())).eq('{"id":"measure","links":[],"validity":-1,"configurationAsJSON":"{\\"test\\":true}","values":[10,11]}');
    });

});
