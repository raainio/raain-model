import {expect} from 'chai';
import {MeasureValuePolarContainer, PolarMeasureValue, RadarMeasure, RadarNode, RadarPolarMeasureValue, TeamNode} from '../../src';
import {promisify} from 'util';

const sleep = promisify(setTimeout);

describe('Radar', () => {

    const optionalTrace = (...log: any[]) => {
        // console.log(new Date().toISOString(), log)
    }

    const optionalTable = (a: any[]) => {
        // console.table(a)
    }

    it('should create ones', () => {
        const team1 = new TeamNode({
            id: 'tid1',
            name: 'team1',
            description: 'team...',
            contracts: ['basic'],
            contacts: []
        });

        const radarNode = new RadarNode({
            id: 'RadarNode looks OK.', name: 'name', links: [],
            latitude: 1, longitude: 1,
            team: team1
        });
        expect(radarNode.id).eq('RadarNode looks OK.');
        expect(JSON.stringify(radarNode.toJSON()))
            .eq('{"id":"RadarNode looks OK.","links":[],"name":"name","latitude":1,"longitude":1,"team":"tid1"}');
    });

    it('should transform Polar', () => {

        const measureValuePolarContainer = new MeasureValuePolarContainer({azimuth: 0, distance: 1, polarEdges: [33, 45.5]});
        const polarMeasureValue = new PolarMeasureValue({
            measureValuePolarContainers: [measureValuePolarContainer],
            azimuthsCount: 720,
            polarEdgesCount: 250
        });
        const radarPolarMeasureValue1 = new RadarPolarMeasureValue({polarMeasureValue, angle: 1, axis: 0});
        expect(radarPolarMeasureValue1.getAzimuthsCount()).equal(720);
        expect(radarPolarMeasureValue1.getPolarEdgesCount()).equal(250);

        const radarPolarMeasureValue2 = new RadarPolarMeasureValue({polarMeasureValue: radarPolarMeasureValue1, angle: 1, axis: 0});
        expect(radarPolarMeasureValue2.getAzimuthsCount()).equal(720);
        expect(radarPolarMeasureValue2.getPolarEdgesCount()).equal(250);
        expect(JSON.stringify(radarPolarMeasureValue2.toJSONWithPolarStringified()))
            .eq(JSON.stringify(radarPolarMeasureValue1.toJSONWithPolarStringified()));
        expect(JSON.stringify(radarPolarMeasureValue2.toJSONWithPolarStringified()))
            .eq('{"polarMeasureValue":"{\\"measureValuePolarContainers\\":\\"[{\\\\\\"azimuth\\\\\\":0,\\\\\\"distance\\\\\\":1,\\\\\\"polarEdges\\\\\\":[33,45.5],\\\\\\"edgeOffset\\\\\\":0}]\\",\\"azimuthsCount\\":720,\\"polarEdgesCount\\":250}","angle":1,"axis":0}');

        const radarPolarMeasureValue3 = new RadarPolarMeasureValue(radarPolarMeasureValue1.toJSONWithPolarStringified());
        expect(radarPolarMeasureValue3.getAzimuthsCount()).equal(720);
        expect(radarPolarMeasureValue3.getPolarEdgesCount()).equal(250);
        expect(JSON.stringify(radarPolarMeasureValue3.toJSONWithPolarStringified()))
            .eq(JSON.stringify(radarPolarMeasureValue1.toJSONWithPolarStringified()));
        expect(JSON.stringify(radarPolarMeasureValue3.toJSONWithPolarStringified()))
            .eq('{"polarMeasureValue":"{\\"measureValuePolarContainers\\":\\"[{\\\\\\"azimuth\\\\\\":0,\\\\\\"distance\\\\\\":1,\\\\\\"polarEdges\\\\\\":[33,45.5],\\\\\\"edgeOffset\\\\\\":0}]\\",\\"azimuthsCount\\":720,\\"polarEdgesCount\\":250}","angle":1,"axis":0}');

        const radarMeasure = new RadarMeasure({id: 'measureId', values: [polarMeasureValue], date: new Date(100000)});
        expect(JSON.stringify(radarMeasure.toJSON()))
            .eq('{"id":"measureId","links":[],"date":"1970-01-01T00:01:40.000Z","validity":-1,"values":[{"measureValuePolarContainers":[{"azimuth":0,"distance":1,"polarEdges":[33,45.5],"edgeOffset":0}],"azimuthsCount":720,"polarEdgesCount":250}]}');

        const polarMeasureValue1 = radarMeasure.values[0] as PolarMeasureValue;
        const radarPolarMeasureValue4 = new RadarPolarMeasureValue({polarMeasureValue: polarMeasureValue1, angle: 1, axis: 0});
        expect(JSON.stringify(radarPolarMeasureValue4.toJSON()))
            .eq('{"polarMeasureValue":{"measureValuePolarContainers":[{"azimuth":0,"distance":1,"polarEdges":[33,45.5],"edgeOffset":0}],"azimuthsCount":720,"polarEdgesCount":250},"angle":1,"axis":0}');
        expect(radarPolarMeasureValue4.getAzimuthsCount()).equal(720);
        expect(radarPolarMeasureValue4.getPolarEdgesCount()).equal(250);

        const radarPolarMeasureValue5 = new RadarPolarMeasureValue({
            polarMeasureValue: JSON.stringify(radarMeasure.values[0]),
            angle: 1, axis: 90
        });
        expect(radarPolarMeasureValue5.getAzimuthsCount()).equal(720);
        expect(radarPolarMeasureValue5.getPolarEdgesCount()).equal(250);

        const team1 = new TeamNode({
            id: 'tid1',
            name: 'team1',
            description: 'team...',
            contracts: ['basic'],
            contacts: []
        });
        const radarNode = new RadarNode({
            id: 'RadarNode looks OK.',
            name: 'name',
            links: [radarMeasure],
            latitude: 1, longitude: 1,
            team: team1
        });

        expect(JSON.stringify(radarNode.toJSON()))
            .eq('{"id":"RadarNode looks OK.","links":[{"rel":"radar-measure","href":"../radar-measures/1970-01-01T00:01:40.000Z/measureId"}],"name":"name","latitude":1,"longitude":1,"team":"tid1"}');
    });

    it('should use multi-dimension image', async () => {

        const testOneFake = (move: number) => {
            const radarPolarMeasureValues = RadarPolarMeasureValue.BuildFakeRadarPolarMeasureValues(move);
            expect(radarPolarMeasureValues.length).equal(6);
            const polars = radarPolarMeasureValues[0].polarMeasureValue.getPolars();
            expect(polars.length).equal(720);
            expect(polars[0].polarEdges.length).equal(250);
            optionalTable(polars
                .filter((p, pi) => pi % 10 === 0)
                .map(m =>
                    m.polarEdges
                        .filter((n, ni) => ni % 10 === 0)));
        }

        // for (let move = 0; move < 90; move++) {
        testOneFake(0);
        testOneFake(45);
        testOneFake(90);
        // await sleep(1000);
        // }
    });


});
