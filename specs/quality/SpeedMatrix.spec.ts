import {expect} from 'chai';
import {CartesianValue, Position, QualityPoint, QualityTools, RainComputationQuality, SpeedMatrix, SpeedMatrixContainer} from '../../src';

describe('SpeedMatrix', () => {


    it('should SpeedMatrixContainer CreateFromJson, merge and renderMergedMatrix', () => {

        const speedMatrices = [];
        speedMatrices.push(new SpeedMatrix('1', '', []));
        speedMatrices.push(new SpeedMatrix('2', '', []));
        const speedMatrixContainer = new SpeedMatrixContainer({matrices: speedMatrices});

        const speedMatrixContainerTwin = SpeedMatrixContainer.CreateFromJson(speedMatrixContainer.toJSON());
        const optionsForFairCompare = {
            removeFlatten: true,
            removeMatrices: true,
            removeIndicators: true,
        };

        expect(JSON.stringify(speedMatrixContainer.toJSON(optionsForFairCompare)))
            .equal(JSON.stringify(speedMatrixContainerTwin.toJSON(optionsForFairCompare)));

        const qualityPoint1 = new QualityPoint({
            gaugeId: 'id1',
            gaugeLabel: 'label1',
            gaugeDate: null,
            rainDate: null,
            gaugeCartesianValue: new CartesianValue({value: 1, lat: 0, lng: 0}),
            rainCartesianValues: [new CartesianValue({value: 2, lat: 0, lng: 0}), new CartesianValue({value: 3, lat: 0.01, lng: 0.02})],
            speed: null,
            remark: 'none',
        });
        const qualityPoint2 = new QualityPoint({
            gaugeId: 'id2',
            gaugeLabel: 'label2',
            gaugeDate: null,
            rainDate: null,
            gaugeCartesianValue: new CartesianValue({value: 10, lat: 0, lng: 0}),
            rainCartesianValues: [new CartesianValue({value: 20, lat: 0, lng: 0}), new CartesianValue({value: 30, lat: 0.01, lng: 0.02})],
            speed: null,
            remark: 'none',
        });
        const qualityPoints = [qualityPoint1, qualityPoint2];

        const speedMatrixContainerToMerge = SpeedMatrixContainer.CreateFromJson({
            matrices: [new SpeedMatrix('3', '', qualityPoints)],
            trustedIndicator: 0.85
        });
        speedMatrixContainer.merge(speedMatrixContainerToMerge);

        expect(speedMatrixContainer.getQualityPoints().length).eq(2);
        expect(speedMatrixContainer.getQualityPoints('1').length).eq(0);
        expect(speedMatrixContainer.getQualityPoints('2').length).eq(0);
        expect(speedMatrixContainer.getQualityPoints('3').length).eq(2);
        expect(speedMatrixContainer.getQualityPoints('3')[0].rainCartesianValues.length).eq(2);

        expect(speedMatrixContainer.getQualityPointsByHistoricalPosition(0).length).eq(0);
        expect(speedMatrixContainer.getQualityPointsByHistoricalPosition(2).length).eq(2);
        expect(speedMatrixContainer.getQualityPointsByHistoricalPosition(20).length).eq(0);

        const mergedMatrix = speedMatrixContainer.renderMergedMatrix();
        expect(mergedMatrix.length).eq(Math.pow(SpeedMatrix.DEFAULT_MATRIX_RANGE * 2 + 1, 2));
        expect(mergedMatrix[611].value).eq(1);
        expect(mergedMatrix[611].x).eq(2);
        expect(mergedMatrix[611].y).eq(1);
        speedMatrixContainer.logMergedMatrix({normalize: false});
        speedMatrixContainer.logMergedMatrix({normalize: true});
    });

    it('should SpeedMatrixContainer merge and compare', async () => {

        const dateG1 = new Date(1.1 * 60 * 1000);
        const dateG2 = new Date(7.1 * 60 * 1000);
        const dateG3 = new Date(10.1 * 60 * 1000);
        const dateR1 = new Date(2.1 * 60 * 1000);
        const dateR2 = new Date(5.2 * 60 * 1000);
        const dateR3 = new Date(8.2 * 60 * 1000);

        const speed = {angleInDegrees: 1, pixelsPerPeriod: 2};
        const qp = {
            gaugeId: 'gaugeId1',
            gaugeLabel: 'gaugeLabel',
            gaugeDate: dateG1,
            rainDate: dateR1,
            gaugeCartesianValue: new CartesianValue({value: 10, lat: 1, lng: 2}),
            rainCartesianValues: [new CartesianValue({value: 8, lat: 1, lng: 2}), new CartesianValue({value: 13, lat: 1.01, lng: 2.02})],
            speed: {x: 1, y: 2},
            remark: 'none',
        };
        const qualityPoint1 = new QualityPoint(JSON.parse(JSON.stringify(qp)));
        const qualityPoints1: QualityPoint[] = [qualityPoint1];
        const roundScale: Position = new Position({x: QualityTools.DEFAULT_SCALE, y: QualityTools.DEFAULT_SCALE});

        const flattenPositionRange = {xMin: -4, xMax: 4, yMin: -4, yMax: 4};
        const speedMatrix1 = new SpeedMatrix('0', '', qualityPoints1, speed, 1, flattenPositionRange, roundScale);
        const qualitySpeedMatrixContainer1 = new SpeedMatrixContainer({matrices: [speedMatrix1]});

        // 1) Verify creation
        qualitySpeedMatrixContainer1.logMergedMatrix({normalize: false});
        speedMatrix1.logFlatten();
        expect(qualitySpeedMatrixContainer1.getQuality()).eq(0.5);
        expect(qualitySpeedMatrixContainer1.getMaxGauge()).eq(10);
        expect(qualitySpeedMatrixContainer1.getMaxRain()).eq(10.5);
        expect(qualitySpeedMatrixContainer1.getQualityPoints().length).eq(1);
        expect(qualitySpeedMatrixContainer1.getQualityPoints()[0].getGaugeValue()).eq(10);
        expect(qualitySpeedMatrixContainer1.getQualityPoints()[0].getRainValue()).eq(10.5);
        expect(qualityPoint1.getTimeDeltaInMinutes()).eq(1);

        // Second and Third container to merge
        qp.gaugeDate = dateG2;
        const qualityPoint2_1 = new QualityPoint(JSON.parse(JSON.stringify(qp)));
        qp.gaugeId = 'gaugeId2';
        const qualityPoint2_2 = new QualityPoint(JSON.parse(JSON.stringify(qp)));
        const qualityPoints2: QualityPoint[] = [qualityPoint2_1, qualityPoint2_2];
        const speedMatrix2 = new SpeedMatrix('-2', '', qualityPoints2, speed, 1, flattenPositionRange, roundScale);
        const qualitySpeedMatrixContainer2 = new SpeedMatrixContainer({matrices: [speedMatrix2]});
        qualitySpeedMatrixContainer2.merge(qualitySpeedMatrixContainer1);

        qp.gaugeId = 'gaugeId1';
        qp.gaugeCartesianValue.value += 0.2;
        qp.gaugeDate = dateG3;
        const qualityPoint3_1 = new QualityPoint(JSON.parse(JSON.stringify(qp)));
        qp.gaugeId = 'gaugeId2';
        qp.gaugeCartesianValue.value += 0.2;
        qp.gaugeDate = dateG3;
        const qualityPoint3_2 = new QualityPoint(JSON.parse(JSON.stringify(qp)));
        const qualityPoints3: QualityPoint[] = [qualityPoint3_1, qualityPoint3_2];
        const speedMatrix3 = new SpeedMatrix('3', '', qualityPoints3, speed, 1, flattenPositionRange, roundScale);
        const qualitySpeedMatrixContainer3 = new SpeedMatrixContainer({matrices: [speedMatrix3]});
        qualitySpeedMatrixContainer2.merge(qualitySpeedMatrixContainer3);

        // 2) Verify merging
        qualitySpeedMatrixContainer2.logMergedMatrix({normalize: false});
        expect(qualitySpeedMatrixContainer2.getQuality()).eq(0.38000000000000045);
        expect(qualitySpeedMatrixContainer2.getMaxGauge()).eq(10.399999999999999);
        expect(qualitySpeedMatrixContainer2.getMaxRain()).eq(10.5);
        const qps = qualitySpeedMatrixContainer2.getQualityPoints();
        expect(qps.length).eq(5);
        expect(qps[0].getGaugeValue()).eq(10);
        expect(qps[0].getRainValue()).eq(10.5);

        expect(qualitySpeedMatrixContainer2.getQualityPoints('0').length).eq(1);
        expect(qualitySpeedMatrixContainer2.getQualityPoints('0')[0].getGaugeValue()).eq(10);
        expect(qualitySpeedMatrixContainer2.getQualityPoints('0')[0].getRainValue()).eq(10.5);

        expect(qualitySpeedMatrixContainer2.getQualityPoints('-2').length).eq(2);
        expect(qualitySpeedMatrixContainer2.getQualityPoints('-2')[0].getGaugeValue()).eq(10);
        expect(qualitySpeedMatrixContainer2.getQualityPoints('-2')[0].getRainValue()).eq(10.5);

        expect(qualitySpeedMatrixContainer2.getQualityPoints('3').length).eq(2);
        expect(qualitySpeedMatrixContainer2.getQualityPoints('3')[0].getGaugeValue()).eq(10.2);
        expect(qualitySpeedMatrixContainer2.getQualityPoints('3')[0].getRainValue()).eq(10.5);

        // 3) Verify compare
        const rainComputationQuality1 = new RainComputationQuality({
            id: 'rcq1',
            date: dateR1,
            isReady: true,
            qualitySpeedMatrixContainer: new SpeedMatrixContainer({matrices: [speedMatrix1, speedMatrix2]})
        });
        const rainComputationQuality2 = new RainComputationQuality({
            id: 'rcq2',
            date: dateR2,
            isReady: true,
            qualitySpeedMatrixContainer: qualitySpeedMatrixContainer2
        });
        const rainComputationQuality3 = new RainComputationQuality({
            id: 'rcq3',
            date: dateR3,
            isReady: true,
            qualitySpeedMatrixContainer: new SpeedMatrixContainer({matrices: [speedMatrix2, speedMatrix3]})
        });
        const compares = SpeedMatrixContainer.BuildCompares([rainComputationQuality1, rainComputationQuality2, rainComputationQuality3]);

        // comparesPerDate
        expect(compares.comparesPerDate.length).eq(3);
        expect(compares.comparesPerDate[0].date.getTime()).eq(126000);
        expect(compares.comparesPerDate[1].date.getTime()).eq(312000);
        expect(compares.comparesPerDate[2].date.getTime()).eq(491999);
        expect(compares.comparesPerDate[0].compareTimeline.length).eq(2);
        expect(compares.comparesPerDate[1].compareTimeline.length).eq(3);
        expect(compares.comparesPerDate[2].compareTimeline.length).eq(1);
        expect(compares.comparesPerDate[0].compareTimeline[0].name).contains('in 2');
        expect(compares.comparesPerDate[0].compareTimeline[1].name).contains('in 0');
        expect(compares.comparesPerDate[1].compareTimeline[0].name).contains('in 2');
        expect(compares.comparesPerDate[1].compareTimeline[1].name).contains('in 0');
        expect(compares.comparesPerDate[1].compareTimeline[2].name).contains('since 3');
        expect(compares.comparesPerDate[2].compareTimeline[0].name).contains('since 3');
        expect(compares.comparesPerDate[0].compareTimeline[0].qualityPoints.length).eq(2);
        expect(compares.comparesPerDate[0].compareTimeline[1].qualityPoints.length).eq(1);
        expect(compares.comparesPerDate[1].compareTimeline[0].qualityPoints.length).eq(0);
        expect(compares.comparesPerDate[1].compareTimeline[1].qualityPoints.length).eq(0);
        expect(compares.comparesPerDate[1].compareTimeline[2].qualityPoints.length).eq(2);
        expect(compares.comparesPerDate[2].compareTimeline[0].qualityPoints.length).eq(0);

        // cumulative
        expect(compares.compareCumulative.qualityPoints.length).eq(2);
        expect(compares.compareCumulative.qualityPointsLegacy.length).eq(2);
        expect(compares.compareCumulative.qualityPoints[0].gaugeId).eq('gaugeId2');
        expect(compares.compareCumulative.qualityPoints[0].getGaugeValue()).eq(20.4);
        expect(compares.compareCumulative.qualityPoints[0].getRainValue()).eq(21);
        expect(compares.compareCumulative.qualityPoints[1].gaugeId).eq('gaugeId1');
        expect(compares.compareCumulative.qualityPoints[1].getGaugeValue()).eq(30.2);
        expect(compares.compareCumulative.qualityPoints[1].getRainValue()).eq(31.5);
        expect(compares.compareCumulative.maxValue).eq(31.5);

    });

});
