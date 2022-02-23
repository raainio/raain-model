const chai = require('chai');
chai.use(require('chai-as-promised'));
chai.should();
const {promisify} = require('util');
const sleep = promisify(setTimeout);
const {
    $app,
    request,
    cleanup,
    RadarNode,
    RadarNodeMap,
    RainNode,
    GaugeNode,
    RadarMeasure,
    RainComputationNode,
    RainComputationMap,
    RadarMeasureValue,
    RainMeasureValue,
    MeasureValuePolarContainer,
    RainMeasure,
    GaugeMeasure,
    GaugeNodeMap
} = require('../helper');

describe('as Customer with all roles', function () {

    const _created = {};

    before(async () => {
        await cleanup();
    });

    after(async () => {
        // await cleanup();
    });

    describe('during team check', () => {

        it('should get customerTeam', async () => {
            const res = (await request(await $app).get('/v1/teams?name=customerTeam'))
                .expect('Content-Type', /application\/json/)
                .expect(200);

            res.body.toString().should.equal({
                "name": "customerTeam",
                "contract": "basic"
            }.toString());
        });

    });

    describe('during radars setup', () => {

        xit('should 401 from not authorized user', async () => {
            const res = (await request(await $app).get('/v1/radars'))
                // TODO .auth('username', 'password')
                //      .set('Accept', 'application/json')
                .expect('Content-Type', /application\/json/)
                .expect(401)
                .expect(/Authorization needed \(012\)/);

            res.body.should.equal('???');
        });

        it('should create a new radar', async () => {
            const res = (await request(await $app).post('/v1/radars'))
                .send({
                    name: 'asCustomer.testPost',
                    latitude: 5.6,
                    longitude: -4.2,
                    team: 'customerTeam',
                })
                .expect('Content-Type', /application\/json/)
                .expect(201);

            _created.createdRadar = new RadarNode(res.body);
            _created.createdRadar.should.not.be.undefined;
            _created.createdRadar.id.should.not.be.undefined;
            _created.createdRadar.name.should.equal('asCustomer.testPost');
            _created.createdRadar.latitude.should.equal(5.6);
            _created.createdRadar.longitude.should.equal(-4.2);
            _created.createdRadar.getLink('rain').should.be.not.undefined;
            _created.createdRadar.getLinkId('rain').should.be.not.undefined;
        });

        it('should modify the created radar', async () => {
            const res = (await request(await $app).put('/v1/radars/' + _created.createdRadar.id))
                .send({
                    name: 'asCustomer.testPut',
                    latitude: 9.2,
                    longitude: 7.2
                })
                .expect('Content-Type', /application\/json/)
                .expect(200);

            const modifiedRadar = new RadarNode(res.body);
            modifiedRadar.should.not.be.undefined;
            modifiedRadar.id.should.not.be.undefined;
            modifiedRadar.name.should.equal('asCustomer.testPut');
            modifiedRadar.latitude.should.equal(9.2);
            modifiedRadar.longitude.should.equal(7.2);
        });

        it('should get the radar information', async () => {
            const res = await request(await $app)
                .get('/v1/radars/' + _created.createdRadar.id)
                .expect('Content-Type', /application\/json/)
                .expect(200);

            const receivedRadar = new RadarNode(res.body);
            receivedRadar.should.not.be.undefined;
            receivedRadar.id.should.not.be.undefined;
            receivedRadar.name.should.equal('asCustomer.testPut');
            receivedRadar.latitude.should.equal(9.2);
            receivedRadar.longitude.should.equal(7.2);
        });

        xit('should not create another radar', async () => {
            await request(await $app)
                .post('/v1/radars')
                .send({
                    name: 'asCustomer.anotherTest',
                    latitude: 1,
                    longitude: 1
                })
                .expect('Content-Type', /application\/json/)
                .expect(409);
        });

        it('should post radar measures', async () => {
            const values = _buildRadarMeasures();
            _created.createdRadarMeasures = [];
            const date1 = new Date('2018-06-01 13:05:00') // 2018-06-01T11:05:00.000Z
            const data = {
                date: date1,
                values: values
            };
            let res = await request(await $app)
                .post('/v1/radars/' + _created.createdRadar.id + '/measures')
                // TODO .set('Authorization', 'Basic ' + btoa('' + _mocks.userAdmin.email + ':' + _mocks.userAdmin.password))
                .send(data)
                .expect('Content-Type', /application\/json/)
                .expect(201);

            const measure = new RadarMeasure(res.body)
            measure.should.be.not.undefined;
            measure.id.should.be.not.undefined;
            measure.date.should.equal(date1.toISOString());
            measure.values.length.should.equal(values.length);
            _created.createdRadarMeasures.push(measure);

            // Post another one, for fun :)
            const date2 = new Date('2018-06-01 13:12:34'); // 2018-06-01T11:12:34.000Z
            res = await request(await $app)
                .post('/v1/radars/' + _created.createdRadar.id + '/measures')
                .send({
                    date: date2,
                    values: values
                })
                .expect('Content-Type', /application\/json/)
                .expect(201);

            _created.createdRadarMeasures.push(new RadarMeasure(res.body));
        });

        it('should get the radar measures information', async () => {
            const res = await request(await $app)
                .get('/v1/radars/' + _created.createdRadar.id + '/measures/' + _created.createdRadarMeasures[0].id)
                //.set('Authorization', 'Basic ' + btoa('' + _mocks.userAdmin.email + ':' + _mocks.userAdmin.password))
                .expect('Content-Type', /application\/json/)
                .expect(200);

            const radarMeasure = new RadarMeasure(res.body);
            radarMeasure.id.should.equal(_created.createdRadarMeasures[0].id);
            radarMeasure.date.should.equal(_created.createdRadarMeasures[0].date);
            radarMeasure.values.length.should.equal(_created.createdRadarMeasures[0].values.length);
        });

        it('should get the radar information as a map format', async () => {
            const res = await request(await $app)
                .get('/v1/radars/' + _created.createdRadar.id + '?format=map&begin=2018-06-01 12:05:06&end=2018-06-01 13:05:06')
                .expect('Content-Type', /application\/json/)
                .expect(200);

            const receivedRadarMap = new RadarNodeMap(res.body);
            receivedRadarMap.should.not.be.undefined;
            receivedRadarMap.id.should.not.be.undefined;
            receivedRadarMap.getMapData().length.should.equal(1);
            receivedRadarMap.getMapData()[0].id.should.not.be.undefined;
            receivedRadarMap.getMapData()[0].date.should.not.be.undefined;
            receivedRadarMap.getMapData()[0].values.length.should.equal(3);

            const radarMeasure0 = new RadarMeasure(receivedRadarMap.getMapData()[0]);
            radarMeasure0.id.should.not.be.undefined;
            radarMeasure0.date.should.not.be.undefined;

            const measure0 = new RadarMeasureValue(radarMeasure0.values[0]);
            measure0.angle.should.equal(0.4);
            measure0.getPolars().length.should.equal(720);
            new MeasureValuePolarContainer(measure0.getPolars()[200]).azimuth.should.equal(100);
            new MeasureValuePolarContainer(measure0.getPolars()[200]).distance.should.equal(1);
            new MeasureValuePolarContainer(measure0.getPolars()[200]).polarEdges.length.should.equal(250);

            const measure1 = new RadarMeasureValue(radarMeasure0.values[1]);
            measure1.angle.should.equal(1.4);
            measure1.getPolars().length.should.equal(720);
            new MeasureValuePolarContainer(measure1.getPolars()[200]).azimuth.should.equal(100);
            new MeasureValuePolarContainer(measure1.getPolars()[200]).distance.should.equal(1);
            new MeasureValuePolarContainer(measure1.getPolars()[200]).polarEdges.length.should.equal(250);
        });

    });

    describe('during gauges setup', () => {

        xit('should 401 from not authorized user', async () => {
            const res = await request(await $app)
                .get('/v1/gauges')
                // .auth('username', 'password')
                //      .set('Accept', 'application/json')
                .expect('Content-Type', /application\/json/)
                .expect(401)
                .expect(/Authorization needed \(012\)/);

            res.body.should.equal('???');
        });

        it('should create a new gauge', async () => {
            const res = await request(await $app)
                .post('/v1/gauges')
                .send({
                    name: 'asCustomer.testPost',
                    latitude: 5.6,
                    longitude: -4.2,
                    team: 'customerTeam',
                })
                .expect('Content-Type', /application\/json/)
                .expect(201);

            _created.createdGauge = new GaugeNode(res.body);
            _created.createdGauge.should.not.be.undefined;
            _created.createdGauge.id.should.not.be.undefined;
            _created.createdGauge.name.should.equal('asCustomer.testPost');
            _created.createdGauge.latitude.should.equal(5.6);
            _created.createdGauge.longitude.should.equal(-4.2);
        });

        it('should modify the created gauge', async () => {
            const res = await request(await $app)
                .put('/v1/gauges/' + _created.createdGauge.id)
                .send({
                    name: 'asCustomer.testPut',
                    latitude: 9.198,  // 9.2
                    longitude: 7.201  // 7.2
                })
                .expect('Content-Type', /application\/json/)
                .expect(200);

            const modifiedGauge = new GaugeNode(res.body);
            modifiedGauge.should.not.be.undefined;
            modifiedGauge.id.should.not.be.undefined;
            modifiedGauge.name.should.equal('asCustomer.testPut');
            modifiedGauge.latitude.should.equal(9.198);
            modifiedGauge.longitude.should.equal(7.201);
        });

        it('should get the gauge information', async () => {
            const res = await request(await $app)
                .get('/v1/gauges/' + _created.createdGauge.id)
                .expect('Content-Type', /application\/json/)
                .expect(200);

            const receivedGauge = new GaugeNode(res.body);
            receivedGauge.should.not.be.undefined;
            receivedGauge.id.should.not.be.undefined;
            receivedGauge.name.should.equal('asCustomer.testPut');
            receivedGauge.latitude.should.equal(9.198);
            receivedGauge.longitude.should.equal(7.201);
        });

        it('should get the all gauges information', async () => {
            const res = await request(await $app)
                .get('/v1/gauges')
                .expect('Content-Type', /application\/json/)
                .expect(200);

            const receivedGauges = res.body.gauges;
            receivedGauges.length.should.be.equal(1);
            receivedGauges.forEach(rg => {
                const gauge = new GaugeNode(rg);
                gauge.id.should.not.be.undefined;
                gauge.name.should.equal('asCustomer.testPut');
                gauge.latitude.should.equal(9.198);
                gauge.longitude.should.equal(7.201);
            });
        });

        it('should post gauge measures', async () => {
            const value = 0.765; // _buildGaugeMeasure();
            const res = await request(await $app)
                .post('/v1/gauges/' + _created.createdGauge.id + '/measures')
                // .set('Authorization', 'Basic ' + btoa('' + _mocks.userAdmin.email + ':' + _mocks.userAdmin.password))
                .send({
                    date: '2018-06-01T11:05:00.000Z',
                    values: [value]
                })
                .expect('Content-Type', /application\/json/)
                .expect(201);

            const measure = new GaugeMeasure(res.body)
            measure.should.be.not.undefined;
            measure.id.should.be.not.undefined;
            measure.date.should.be.equal('2018-06-01T11:05:00.000Z');
        });

        it('should get gauge measures', async () => {
            const res = await request(await $app)
                .get('/v1/gauges/' + _created.createdGauge.id + '?format=map&begin=2018-06-01 12:05:06&end=2018-06-01 13:05:06')
                .expect('Content-Type', /application\/json/)
                .expect(200);

            const receivedGaugeMap = new GaugeNodeMap(res.body);
            receivedGaugeMap.id.should.be.equal(_created.createdGauge.id);
            receivedGaugeMap.getMapData().length.should.be.equal(1);
            const gaugeMeasuresMap = receivedGaugeMap.getMapData();
            gaugeMeasuresMap[0].values[0].should.be.equal(0.765);

        });

    });

    describe('expecting rains computations', () => {

        it('should get the created radar linked rains zones', async () => {
            const rainId = _created.createdRadar.getLinkId('rain');
            rainId.should.be.not.undefined;

            let res = await request(await $app)
                .get('/v1/rains/' + rainId)
                .expect('Content-Type', /application\/json/)
                .expect(200);

            _created.createdRain = new RainNode(res.body);
            _created.createdRain.should.be.not.undefined;
            _created.createdRain.id.should.be.equal(rainId);
            _created.createdRain.status.should.equal(0);
            _created.createdRain.quality.should.equal(-1);
            _created.createdRain.getLinkId('radar').should.equal(_created.createdRadar.id);
        });

        it('should not modify rain zone and wait for rain validation by raain team (ask to your contact@raain.io)', async () => {
            const rainId = _created.createdRadar.getLinkId('rain');
            await request(await $app)
                .put('/v1/rains/' + rainId)
                .send({
                    step: 'prepare',
                    radarMeasureToIdentifyEchoes: _created.createdRadarMeasures[0].id,
                    inputsAreValidated: 1
                })
                .expect('Content-Type', /application\/json/)
                .expect(403);
        });

        it('should get (before any computation) the status of the zone : prepared/ready or not', async () => {
            const rainId = _created.createdRadar.getLinkId('rain');
            await sleep(1800);

            let res = await request(await $app)
                .get('/v1/rains/' + rainId)
                .expect('Content-Type', /application\/json/)
                .expect(200);

            const rainNode = new RainNode(res.body);
            rainNode.status.should.be.gte(0.2);
            // rainNode.quality.should.equal(-0.5); // === system still doesn't know
        });

        it('should keep calm and carry on ;)', async () => {
            const rainId = _created.createdRadar.getLinkId('rain');
            await sleep(10000);

            let res = await request(await $app)
                .get('/v1/rains/' + rainId)
                .expect('Content-Type', /application\/json/)
                .expect(200);

            await sleep(1000);

            const rainNode = new RainNode(res.body);
            rainNode.status.should.equal(1);
            rainNode.quality.should.equal(1);
        }).timeout(12000);

        it('should ask (post) for rain computation', async () => {
            const rainId = _created.createdRadar.getLinkId('rain');
            let res = await request(await $app)
                .post('/v1/rains/' + rainId + '/computations')
                .send({
                    periodBegin: new Date('2018-06-01 13:05:00'),
                    periodEnd: new Date('2018-06-01 14:10:00'),
                    limit: 10
                })
                .expect('Content-Type', /application\/json/)
                .expect(202);

            await sleep(10000);

            const computations = res.body.computations;
            computations.length.should.equal(2);
            computations.forEach((c, index) => {
                const rc = new RainComputationNode(c);
                const begin = new Date(_created.createdRadarMeasures[index].date);
                const end = new Date(begin.getTime() + 5 * 60000);
                rc.id.should.be.not.undefined;
                rc.periodBegin.should.equal(begin.toISOString());
                rc.periodEnd.should.equal(end.toISOString());
                rc.progressIngest.should.equal(1);
                rc.progressComputing.should.equal(0.4);
                rc.launchedBy.email.should.equal('asCustomer@test.com');
                rc.getLinkId('radar', 0).should.equal(_created.createdRadar.id);
                rc.getLinkId('rain').should.equal(rainId);
                rc.getLinkId('radar-measure').should.equal(_created.createdRadarMeasures[index].id);
            });
            _created.createdRainComputation = new RainComputationNode(computations[0]);
        }).timeout(11000);

        it('should get the rain computation in progress status', async () => {
            const rainId = _created.createdRadar.getLinkId('rain');

            let res = await request(await $app)
                .get('/v1/rains/' + rainId + '/computations/' + _created.createdRainComputation.id)
                .expect('Content-Type', /application\/json/);
            //.expect(202);

            (res.status === 202 || res.status === 200).should.be.true;
            const rainComputation = new RainComputationNode(res.body);
            rainComputation.progressComputing.should.be.greaterThan(0);
        })

        it('should get the rain computation final status', async () => {
            const rainId = _created.createdRadar.getLinkId('rain');
            await sleep(2000);

            let res = await request(await $app)
                .get('/v1/rains/' + rainId + '/computations/' + _created.createdRainComputation.id)
                .expect('Content-Type', /application\/json/)
                .expect(200);

            const rainComputation = new RainComputationNode(res.body);
            rainComputation.should.be.not.undefined;
            rainComputation.progressIngest.should.equal(1);
            rainComputation.progressComputing.should.be.greaterThan(0);
        }).timeout(4000);

        it('should get the rain computation result : formatted by id, map or compare', async () => {
            const rainId = _created.createdRadar.getLinkId('rain');

            let res = await request(await $app)
                .get('/v1/rains/' + rainId + '/computations?format=id&begin=2018-06-01T11:00:00.000Z&end=2018-06-01T14:00:00.000Z')
                .expect('Content-Type', /application\/json/)
                .expect(200);
            res.body.computations.length.should.equal(2);
            res.body.computations[0].id.should.equal(_created.createdRainComputation.id);
            res.body.computations[0].links[0].rel.should.equal('rain');
            res.body.computations[0].links[0].href.should.equal('rains/' + rainId);
            res.body.computations[0].links[1].rel.should.equal('radar-measure');
            res.body.computations[0].links[1].href.should.equal('radar-measures/' + _created.createdRadarMeasures[0].id);

            res = await request(await $app)
                .get('/v1/rains/' + rainId + '/computations/' + _created.createdRainComputation.id + '?format=map')
                .expect('Content-Type', /application\/json/)
                .expect(200);
            const rainComputationMap = new RainComputationMap(res.body);
            rainComputationMap.should.be.not.undefined;
            rainComputationMap.periodBegin.should.equal("2018-06-01T11:05:00.000Z");
            rainComputationMap.periodEnd.should.equal("2018-06-01T11:10:00.000Z");
            rainComputationMap.id.should.not.be.undefined;
            rainComputationMap.getMapData().length.should.equal(1);
            rainComputationMap.getLinkId('radar', 0).should.equal(_created.createdRadar.id);
            rainComputationMap.getLinkId('rain', 0).should.equal(rainId);
            rainComputationMap.progressIngest.should.equal(1);
            rainComputationMap.progressComputing.should.equal(1);
            rainComputationMap.timeSpentInMs.should.be.greaterThan(10);
            rainComputationMap.timeSpentInMs.should.be.lessThan(200);

            const rainMeasure0 = new RainMeasure(rainComputationMap.getMapData()[0]);
            rainMeasure0.id.should.be.not.undefined;
            rainMeasure0.date.should.equal(rainComputationMap.periodBegin)
            const measure0 = new RainMeasureValue(rainMeasure0.values[0]);
            measure0.getPolars().length.should.equal(720);
            new MeasureValuePolarContainer(measure0.getPolars()[200]).azimuth.should.equal(100);
            new MeasureValuePolarContainer(measure0.getPolars()[200]).distance.should.equal(1);
            new MeasureValuePolarContainer(measure0.getPolars()[200]).polarEdges.length.should.equal(250);

            res = await request(await $app)
                .get('/v1/rains/' + rainId + '/computations?format=compare&begin=2018-06-01T11:00:00.000Z&end=2018-06-01T14:00:00.000Z')
                .expect('Content-Type', /application\/json/)
                .expect(200);
            res.body.points.length.should.equal(1);
            res.body.points[0].x.should.equal(23.686755555555557);
            res.body.points[0].y.should.equal(0.765);
            res.body.max.x.should.equal(23.686755555555557);
            res.body.max.y.should.equal(0.765);
            res.body.vector.speedMetersPerSec.should.equal(1);
            res.body.vector.angleDegrees.should.equal(153.5);
            res.body.indicator.should.equal(22.921755555555556);
        });

        it('should (as shortcut) get the last computations in rain zone', async () => {
            const rainId = _created.createdRadar.getLinkId('rain');
            let res = await request(await $app)
                .get('/v1/rains/' + rainId)
                .expect('Content-Type', /application\/json/)
                .expect(200);

            const rainNode = new RainNode(res.body);
            rainNode.status.should.equal(1);
            rainNode.getLinkId('rain-computation', 0).should.equal(_created.createdRainComputation.id);
        });

        it('should (as awesome shortcut) get the rain computation result directly from a radar measure post (or put)', async () => {
            // const rainId = _created.createdRadar.getLinkId('rain');
            // let res = await request(await $app)
            //     // .post('/v1/radars/' + _created.createdRadar.id + '/measures')
            //     // or
            //     .put('/v1/radars/' + _created.createdRadar.id + '/measures/' + _created.createdRadarMeasures[0].id)
            //     .send({computation: true})
            //     .expect('Content-Type', /application\/json/)
            //     .expect(201);

            // const measure = new RadarMeasure(res.body);
            // measure.should.be.not.undefined;
            // measure.links.computations.should.be.not.undefined;
            // measure.links.computations.length.should.equal(1);
            //
            // res = await request(await $app)
            //     .get('/v1/rains/' + rainId + '/computations/' + measure.links.computations[0])
            //     .expect('Content-Type', /application\/json/)
            //     .expect(200);
            //
            // const rainComputation = new RainComputationNode(res.body);
            // rainComputation.should.be.not.undefined;
            // rainComputation.progressIngest.should.equal(1);
            // rainComputation.progressComputing.should.equal(1);
            // rainComputation.timeSpentInMs.should.greaterThan(0);
            //
            // res = await request(await $app)
            //     .get('/v1/rains/' + rainId + '/computations/' + _created.createdRainComputation.id + '?format=map')
            //     .expect('Content-Type', /application\/json/)
            //     .expect(200);
            // const rainComputationMap = new RainComputationMap(res.body);
            // rainComputationMap.should.be.not.undefined;
            // rainComputationMap.map.should.equal('????');
        });

    });

    // TODO refactor using raain-model
    const _buildRadarMeasures = () => {
        const values = [];
        for (let angle = 0.4; angle < 3; angle++) {
            let value = {angle: angle};
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
                    polarEdges: data
                };
                polars.push(polar);
            }
            value.polars = polars;
            values.push(value);
        }
        return values;
    };

    const _buildGaugeMeasure = () => {
        return Math.floor(Math.random() * Math.floor(12));
    };

});

xdescribe('as Customer with `customerInsert` role', function () {

    it('should post/put on radars, gauges', () => {
        'todo'.should.equal('todo?', 'TODO');
    });

    it('should not access other api', () => {
        'todo'.should.equal('todo?', 'TODO');
    });

});

xdescribe('as Customer with `customerWeb` role', function () {

    it('should get on radars, gauges, rains', () => {
        'todo'.should.equal('todo?', 'TODO');
    });

    it('should not modify radars, gauges, rains', () => {
        'todo'.should.equal('todo?', 'TODO');
    });

    it('should not access other api', () => {
        'todo'.should.equal('todo?', 'TODO');
    });

});

xdescribe('as Customer with `customerResult` role', function () {

    it('should get rains dedicated result', () => {
        'todo'.should.equal('todo?', 'TODO');
    });

    it('should not modify anything', () => {
        'todo'.should.equal('todo?', 'TODO');
    });

    it('should not access other api', () => {
        'todo'.should.equal('todo?', 'TODO');
    });

});

xdescribe('as Customer with `customerComputing` role', function () {

    it('should get rains dedicated result', () => {
        'todo'.should.equal('todo?', 'TODO');
    });

    it('should not modify anything', () => {
        'todo'.should.equal('todo?', 'TODO');
    });

    it('should not access other api', () => {
        'todo'.should.equal('todo?', 'TODO');
    });

});

xdescribe('as Customer with `customerAdmin` role (IN PROGRESS)', function () {

    it('should post/put users and his team', () => {
        'todo'.should.equal('todo?', 'TODO');
    });

    it('should not modify anything', () => {
        'todo'.should.equal('todo?', 'TODO');
    });

    it('should not access other api', () => {
        'todo'.should.equal('todo?', 'TODO');
    });

});
