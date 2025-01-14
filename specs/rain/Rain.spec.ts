import {expect} from 'chai';
import {
    CartesianValue,
    LatLng,
    PolarMeasureValue,
    QualityTools,
    RadarNode,
    RainCartesianMeasureValue,
    RainComputation,
    RainComputationMap,
    RainComputationQuality,
    RainMeasure,
    RainNode,
    RainPolarMeasureValue,
    SpeedMatrixContainer,
    TeamNode
} from '../../src';

describe('Rain', () => {

    const optionalTrace = (...log: any[]) => {
        // console.log(new Date().toISOString(), log)
    }

    it('should create simple ones', () => {
        const rainNodeEmpty = new RainNode({
            id: 'notEmpty',
            name: '',
            links: [],
            team: null
        });
        expect(JSON.stringify(rainNodeEmpty.toJSON()))
            .eq('{"id":"notEmpty","links":[],"name":"","status":-1,"quality":-1,"team":null,' +
                '"radars":[],"gauges":[],"lastCompletedComputations":[]}');
        expect(rainNodeEmpty.getCenter().lat).eq(0);
        expect(rainNodeEmpty.getCenter().lng).eq(0);

        const radarNode1 = new RadarNode({
            id: 'rid',
            latitude: 1, longitude: 1,
            name: 'rname',
            team: null
        });
        const radarNode2 = new RadarNode({
            id: 'rid',
            latitude: 4, longitude: 6,
            name: 'rname',
            team: null
        });
        const rainNodeWithRadars = new RainNode({
            id: 'notEmpty',
            name: '',
            team: null,
            radars: [radarNode1, radarNode2],
        });
        expect(JSON.stringify(rainNodeWithRadars.toJSON()))
            .eq('{"id":"notEmpty","links":[{"rel":"radar","href":"../radars/rid"}],"name":"","status":-1,"quality":-1,"team":null,' +
                '"latLngRectsAsJSON":"[[{\\"lat\\":2,\\"lng\\":0},{\\"lat\\":0,\\"lng\\":2}],[{\\"lat\\":5,\\"lng\\":5},{\\"lat\\":3,\\"lng\\":7}]]",' +
                '"radars":["rid"],"gauges":[],"lastCompletedComputations":[]}');

        expect(rainNodeWithRadars.getCenter().lat).eq(2.5);
        expect(rainNodeWithRadars.getCenter().lng).eq(3.5);
        expect(JSON.stringify(rainNodeWithRadars.getLimitPoints())).eq('[{"lat":0,"lng":0},{"lat":5,"lng":7}]');


    });

    it('should create some', () => {

        const team1 = new TeamNode({
            id: 'tid1',
            name: 'team1',
            description: 'team...',
            contracts: ['basic'],
            contacts: []
        });
        const radarNode = new RadarNode({
            id: 'r1',
            latitude: 1, longitude: 1,
            name: 'any name',
            team: team1
        });
        const rainComputationEmpty = new RainComputation({
            id: 'rc1',
            date: new Date(10000000),
            isReady: null,
            results: null,
            version: '1.0.0'
        });

        const topLeft1 = new LatLng({lat: 1.23, lng: 2.65});
        const bottomRight1 = new LatLng({lat: 1.13, lng: 2.75});
        const topLeft2 = new LatLng({lat: 2.23, lng: 3.65});
        const bottomRight2 = new LatLng({lat: 2.13, lng: 3.75});
        const latLngRects = [[topLeft1, bottomRight1], [topLeft2, bottomRight2]]
        const rainNode = new RainNode({
            id: 'RainNode looks OK.',
            name: 'name',
            links: [radarNode, rainComputationEmpty, null],
            latLngRectsAsJSON: JSON.stringify(latLngRects),
            team: team1
        });
        expect(rainNode.id).eq('RainNode looks OK.');
        expect(JSON.stringify(rainNode.toJSON())).eq('' +
            '{"id":"RainNode looks OK.",' +
            '"links":[' +
            '{"rel":"radar","href":"../radars/r1"},' +
            '{"rel":"rain-computation","href":"../rain-computations/1970-01-01T02:46:40.000Z/1.0.0/rc1"}],' +
            '"name":"name","status":-1,"quality":-1,"team":"tid1",' +
            '"latLngRectsAsJSON":"[[{\\"lat\\":1.23,\\"lng\\":2.65},{\\"lat\\":1.13,\\"lng\\":2.75}],[{\\"lat\\":2.23,\\"lng\\":3.65},{\\"lat\\":2.13,\\"lng\\":3.75}]]",' +
            '"radars":["r1"],"gauges":[],"lastCompletedComputations":["rc1"]}');

        expect(rainNode.getCenter().lat).eq(1.68);
        expect(rainNode.getCenter().lng).eq(3.2);
        expect(rainNode.getLinksCount()).eq(2);
        expect(rainNode.getLinksCount(RadarNode.TYPE)).eq(1);
        expect(rainNode.getLinkIds().toString()).eq('r1,rc1');

        const rainComputation = new RainComputation({
            id: 'rc1',
            date: new Date('2022-01-01'),
            links: [radarNode, radarNode, null],
            quality: 1,
            progressIngest: 1,
            progressComputing: 1,
            timeSpentInMs: 100,
            isReady: true,
            isDoneDate: new Date(),
            results: [new RainPolarMeasureValue({
                polarMeasureValue:
                    new PolarMeasureValue({measureValuePolarContainers: [], azimuthsCount: 0, polarEdgesCount: 0}),
                version: 'version2'
            })],
            launchedBy: 'oneUser',
            version: 'v1',
        });

        expect(rainComputation.id).eq('rc1');
        expect(rainComputation.getVersion()).eq('v1');

        const rainComputationQuality = new RainComputationQuality({
            id: 'rcq1',
            date: new Date('2026-07-08'),
            links: [radarNode],
            quality: 1,
            isReady: true,
            rainComputation,
            qualitySpeedMatrixContainer: new SpeedMatrixContainer({matrices: []}),
            version: 'v1'
        });
        expect(rainComputationQuality.id).eq('rcq1');
        expect(rainComputationQuality.getVersion()).eq('v1');
        expect(JSON.stringify(rainComputationQuality.toJSON()))
            .eq('{' +
                '"id":"rcq1",' +
                '"links":[' +
                '{"rel":"radar","href":"../radars/r1"},' +
                '{"rel":"rain-computation","href":"../rain-computations/2022-01-01T00:00:00.000Z/v1/rc1"}' +
                '],' +
                '"version":"v1",' +
                '"date":"2026-07-08T00:00:00.000Z",' +
                '"quality":1,' +
                '"progressIngest":-1,' +
                '"progressComputing":-1,' +
                '"isReady":true,' +
                '"qualitySpeedMatrixContainer":{"qualityPoints":[],"trustedIndicators":[],"flattenMatrices":[],"speed":{"angleInDegrees":0,"pixelsPerPeriod":0},"matrices":[]},' +
                '"rainComputation":"rc1"' +
                '}');

        const cartesianValues = [
            new CartesianValue({value: 123, lat: 10, lng: 20}),
            new CartesianValue({value: 321, lat: 10 + QualityTools.DEFAULT_SCALE, lng: 20 + QualityTools.DEFAULT_SCALE})];
        const cartesianPixelWidth = new LatLng({lat: QualityTools.DEFAULT_SCALE, lng: QualityTools.DEFAULT_SCALE});
        const rainCartesianMeasureValue = new RainCartesianMeasureValue({
            cartesianValues,
            cartesianPixelWidth,
            version: 'test',
            limitPoints: undefined
        })
        const rainMeasure = new RainMeasure({id: 'measure', values: [rainCartesianMeasureValue], configurationAsJSON: '{"test": true}'});
        expect(JSON.stringify(rainMeasure.toJSON()))
            .eq('{"id":"measure","links":[],"validity":-1,"configurationAsJSON":"{\\"test\\":true}","values":[{"cartesianValues":[{"lat":10,"lng":20,"value":123},{"lat":10.01,"lng":20.01,"value":321}],"cartesianPixelWidth":{"lat":0.01,"lng":0.01},"limitPoints":[{"lat":10,"lng":20},{"lat":10.01,"lng":20.01}],"version":"test"}]}');

        const rainComputationMap = new RainComputationMap({
            id: 'rc1',
            date: new Date('2022-01-01'),
            links: [radarNode, radarNode, null],
            quality: 1,
            progressIngest: 1,
            progressComputing: 1,
            timeSpentInMs: 100,
            isReady: true,
            isDoneDate: new Date('1988-01-01'),
            map: [rainMeasure],
            launchedBy: 'oneUser',
            version: 'v1',
        });

        expect(JSON.stringify(rainComputationMap.toJSON()))
            .eq('{"id":"rc1","links":[{"rel":"radar","href":"../radars/r1"}],"version":"v1","date":"2022-01-01T00:00:00.000Z","quality":1,"progressIngest":1,"progressComputing":1,"timeSpentInMs":100,"isReady":true,"isDoneDate":"1988-01-01T00:00:00.000Z","launchedBy":"oneUser","map":"[{\\"id\\":\\"measure\\",\\"links\\":[],\\"validity\\":-1,\\"configurationAsJSON\\":\\"{\\\\\\"test\\\\\\":true}\\",\\"values\\":[{\\"cartesianValues\\":[{\\"lat\\":10,\\"lng\\":20,\\"value\\":123},{\\"lat\\":10.01,\\"lng\\":20.01,\\"value\\":321}],\\"cartesianPixelWidth\\":{\\"lat\\":0.01,\\"lng\\":0.01},\\"limitPoints\\":[{\\"lat\\":10,\\"lng\\":20},{\\"lat\\":10.01,\\"lng\\":20.01}],\\"version\\":\\"test\\"}]}]"}');

        rainComputationMap.setMapData([rainMeasure, rainMeasure]);
        expect(JSON.stringify(rainComputationMap.toJSON()))
            .eq('{"id":"rc1","links":[{"rel":"radar","href":"../radars/r1"}],"version":"v1","date":"2022-01-01T00:00:00.000Z","quality":1,"progressIngest":1,"progressComputing":1,"timeSpentInMs":100,"isReady":true,"isDoneDate":"1988-01-01T00:00:00.000Z","launchedBy":"oneUser","map":"[{\\"id\\":\\"measure\\",\\"links\\":[],\\"validity\\":-1,\\"configurationAsJSON\\":\\"{\\\\\\"test\\\\\\":true}\\",\\"values\\":[{\\"cartesianValues\\":[{\\"lat\\":10,\\"lng\\":20,\\"value\\":123},{\\"lat\\":10.01,\\"lng\\":20.01,\\"value\\":321}],\\"cartesianPixelWidth\\":{\\"lat\\":0.01,\\"lng\\":0.01},\\"limitPoints\\":[{\\"lat\\":10,\\"lng\\":20},{\\"lat\\":10.01,\\"lng\\":20.01}],\\"version\\":\\"test\\"}]},{\\"id\\":\\"measure\\",\\"links\\":[],\\"validity\\":-1,\\"configurationAsJSON\\":\\"{\\\\\\"test\\\\\\":true}\\",\\"values\\":[{\\"cartesianValues\\":[{\\"lat\\":10,\\"lng\\":20,\\"value\\":123},{\\"lat\\":10.01,\\"lng\\":20.01,\\"value\\":321}],\\"cartesianPixelWidth\\":{\\"lat\\":0.01,\\"lng\\":0.01},\\"limitPoints\\":[{\\"lat\\":10,\\"lng\\":20},{\\"lat\\":10.01,\\"lng\\":20.01}],\\"version\\":\\"test\\"}]}]"}');

        const cartesianPixelWidthToRender = new LatLng({lat: 0.03, lng: 0.02});
        const mergeLimitPoints: [LatLng, LatLng] = [new LatLng({lat: 10, lng: 11}), new LatLng({lat: 20, lng: 21})];
        rainComputationMap.setMapData([rainMeasure, rainMeasure], {
            mergeCartesianPixelWidth: cartesianPixelWidthToRender,
            mergeLimitPoints,
            mergeCartesian: true,
            removeNullValues: false,
        });
        expect(JSON.stringify(rainComputationMap.toJSON()))
            .eq('{"id":"rc1","links":[{"rel":"radar","href":"../radars/r1"}],"version":"v1","date":"2022-01-01T00:00:00.000Z","quality":1,"progressIngest":1,"progressComputing":1,"timeSpentInMs":100,"isReady":true,"isDoneDate":"1988-01-01T00:00:00.000Z","launchedBy":"oneUser","map":"[{\\"id\\":\\"measure\\",\\"links\\":[],\\"validity\\":-1,\\"configurationAsJSON\\":\\"{\\\\\\"test\\\\\\":true}\\",\\"values\\":[{\\"cartesianValues\\":[{\\"lat\\":9.99,\\"lng\\":20,\\"value\\":246},{\\"lat\\":10.02,\\"lng\\":20.02,\\"value\\":642}],\\"cartesianPixelWidth\\":{\\"lat\\":0.03,\\"lng\\":0.02},\\"limitPoints\\":[{\\"lat\\":10,\\"lng\\":11},{\\"lat\\":20,\\"lng\\":21}]}]}]"}');

    });

    it('should challenge rainComputationMap.setMapData', () => {

        const cartesianPixelWidthToRender = new LatLng({lat: 0.03, lng: 0.02});
        const cartesianPixelWidthToCompute = new LatLng({lat: 0.012, lng: 0.00876});

        optionalTrace('build..');
        const rainMeasures = [];
        const mergeLimitPoints: [LatLng, LatLng] = [new LatLng({lat: 1, lng: 2}), new LatLng({lat: 10, lng: 12})];
        for (let valueId = 1; valueId < 5; valueId++) {
            const cartesianValues = [];
            let value = valueId;
            for (let lat = mergeLimitPoints[0].lat; lat <= mergeLimitPoints[1].lat; lat += cartesianPixelWidthToCompute.lat) {
                for (let lng = mergeLimitPoints[0].lng; lng <= mergeLimitPoints[1].lng; lng += cartesianPixelWidthToCompute.lng) {
                    cartesianValues.push(new CartesianValue({value: value++, lat, lng}))
                }
            }

            const rainCartesianMeasureValue = new RainCartesianMeasureValue({
                cartesianValues,
                cartesianPixelWidth: cartesianPixelWidthToCompute,
                version: 'test',
                limitPoints: undefined,
            });
            const rainMeasure = new RainMeasure({
                id: 'm_' + valueId,
                values: [rainCartesianMeasureValue],
                configurationAsJSON: '{"test": true}'
            });

            rainMeasures.push(rainMeasure);
            optionalTrace('rainMeasures pushed', value, 'values');
        }
        optionalTrace('build done');

        const rainComputationMap = new RainComputationMap({
            id: 'rc1',
            date: new Date('2022-01-01'),
            links: [],
            quality: 1,
            progressIngest: 1,
            progressComputing: 1,
            timeSpentInMs: 100,
            isReady: true,
            isDoneDate: new Date('1988-01-01'),
            map: [rainMeasures[0]],
            launchedBy: 'test',
            version: 'v1',
        });

        optionalTrace('setMapData...');
        rainComputationMap.setMapData(rainMeasures, {
            mergeCartesianPixelWidth: cartesianPixelWidthToRender,
            mergeLimitPoints,
            mergeCartesian: true,
            removeNullValues: true,
        });

        optionalTrace('setMapData done');
        const mappedRainMeasures = rainComputationMap.getMapData().map(m => new RainMeasure(m as any));
        expect(mappedRainMeasures.length).eq(1);
        const mappedRainCartesianMeasureValues = mappedRainMeasures[0].values.map(m => new RainCartesianMeasureValue(m as any));
        expect(mappedRainCartesianMeasureValues.length).eq(1);
        expect(mappedRainCartesianMeasureValues[0].getCartesianValues().length).eq(150801);

    });

});
