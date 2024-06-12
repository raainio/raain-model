import {expect} from 'chai';
import {CartesianValue, Position, QualityPoint, QualityTools, SpeedMatrix, SpeedMatrixContainer} from '../../src';

describe('SpeedMatrix', () => {


    it('should manipulate SpeedMatrixContainer', () => {

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

        expect(speedMatrixContainer.getQualityPoints().length).eq(0);
        expect(speedMatrixContainer.getQualityPoints('1').length).eq(0);
        expect(speedMatrixContainer.getQualityPoints('2').length).eq(0);
        expect(speedMatrixContainer.getQualityPoints('3').length).eq(2);
        expect(speedMatrixContainer.getQualityPoints('3')[0].rainCartesianValues.length).eq(2);

        expect(speedMatrixContainer.getQualityPointsByHistoricalPosition(0).length).eq(0);
        expect(speedMatrixContainer.getQualityPointsByHistoricalPosition(2).length).eq(2);
        expect(speedMatrixContainer.getQualityPointsByHistoricalPosition(20).length).eq(0);

        const mergedMatrix = speedMatrixContainer.renderMergedMatrix();
        expect(mergedMatrix.length).eq(Math.pow(SpeedMatrix.DEFAULT_MATRIX_RANGE * 2 + 1, 2));
        expect(mergedMatrix[179].value).eq(1);
        expect(mergedMatrix[179].x).eq(2);
        expect(mergedMatrix[179].y).eq(1);
        speedMatrixContainer.logMergedMatrix({normalize: false});
        speedMatrixContainer.logMergedMatrix({normalize: true});
    });

    it('should manipulate SpeedMatrixContainer - other approach', async () => {

        const speed = {angleInDegrees: 1, pixelsPerPeriod: 2};
        const qp = {
            gaugeId: 'id',
            gaugeLabel: 'gaugeLabel',
            gaugeDate: new Date(100000),
            rainDate: new Date(200000),
            gaugeCartesianValue: new CartesianValue({value: 10, lat: 1, lng: 2}),
            rainCartesianValues: [new CartesianValue({value: 8, lat: 1, lng: 2}), new CartesianValue({value: 13, lat: 1.01, lng: 2.02})],
            speed: {x: 1, y: 2},
            remark: 'none',
        };
        const qualityPoint1 = new QualityPoint(qp);
        const qualityPoints1: QualityPoint[] = [qualityPoint1];
        const roundScale: Position = new Position({x: QualityTools.DEFAULT_SCALE, y: QualityTools.DEFAULT_SCALE});

        const flattenPositionRange = {xMin: -4, xMax: 4, yMin: -4, yMax: 4};
        const speedMatrix1 = new SpeedMatrix('1', '', qualityPoints1, speed, 1, flattenPositionRange, roundScale);
        const qualitySpeedMatrixContainer1 = new SpeedMatrixContainer({matrices: [speedMatrix1]});

        // Verify creation
        qualitySpeedMatrixContainer1.logMergedMatrix({normalize: false});
        expect(qualitySpeedMatrixContainer1.getQuality()).eq(0.5);
        expect(qualitySpeedMatrixContainer1.getMaxGauge()).eq(10);
        expect(qualitySpeedMatrixContainer1.getMaxRain()).eq(10.5);
        expect(qualitySpeedMatrixContainer1.getQualityPoints().length).eq(1);
        expect(qualitySpeedMatrixContainer1.getQualityPoints()[0].getGaugeValue()).eq(10);
        expect(qualitySpeedMatrixContainer1.getQualityPoints()[0].getRainValue()).eq(10.5);
        expect(qualityPoint1.getTimeDeltaInMinutes()).eq(2);

        // Second container to merge
        qp.gaugeId = 'otherGaugeId';
        const qualityPoint2 = new QualityPoint(qp);
        const qualityPoints2: QualityPoint[] = [qualityPoint1, qualityPoint2];
        const speedMatrix2 = new SpeedMatrix('2', '', qualityPoints2, speed, 1, flattenPositionRange, roundScale);
        const qualitySpeedMatrixContainer2 = new SpeedMatrixContainer({matrices: [speedMatrix2]});
        qualitySpeedMatrixContainer1.merge(qualitySpeedMatrixContainer2);

        // Verify merging
        qualitySpeedMatrixContainer1.logMergedMatrix({normalize: false});
        expect(qualitySpeedMatrixContainer1.getQuality()).eq(0.5);
        expect(qualitySpeedMatrixContainer1.getMaxGauge()).eq(10);
        expect(qualitySpeedMatrixContainer1.getMaxRain()).eq(10.5);
        expect(qualitySpeedMatrixContainer1.getQualityPoints().length).eq(1);
        expect(qualitySpeedMatrixContainer1.getQualityPoints()[0].getGaugeValue()).eq(10);
        expect(qualitySpeedMatrixContainer1.getQualityPoints()[0].getRainValue()).eq(10.5);

        expect(qualitySpeedMatrixContainer1.getQualityPoints('1').length).eq(1);
        expect(qualitySpeedMatrixContainer1.getQualityPoints('1')[0].getGaugeValue()).eq(10);
        expect(qualitySpeedMatrixContainer1.getQualityPoints('1')[0].getRainValue()).eq(10.5);

        expect(qualitySpeedMatrixContainer1.getQualityPoints('2').length).eq(2);
        expect(qualitySpeedMatrixContainer1.getQualityPoints('2')[0].getGaugeValue()).eq(10);
        expect(qualitySpeedMatrixContainer1.getQualityPoints('2')[0].getRainValue()).eq(10.5);

    });

});
