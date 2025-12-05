import {expect} from 'chai';
import {
    CartesianTools,
    CartesianValue,
    Position,
    QualityIndicatorMethod,
    QualityPoint,
    RainComputationQuality,
    SpeedMatrix,
    SpeedMatrixContainer,
} from '../../src';

describe('SpeedMatrixContainer (additional tests)', () => {
    const buildQP = (gaugeId: string, gauge: number, rain: number, dates?: {g: Date; r: Date}) =>
        new QualityPoint({
            gaugeId,
            gaugeLabel: gaugeId,
            gaugeDate: dates?.g ?? new Date(0),
            rainDate: dates?.r ?? new Date(0),
            gaugeCartesianValue: new CartesianValue({value: gauge, lat: 0, lng: 0}),
            rainCartesianValues: [new CartesianValue({value: rain, lat: 0, lng: 0})],
            speed: null,
            remark: '',
        });

    const smallRange = {xMin: -1, xMax: 1, yMin: -1, yMax: 1};
    const roundScale: Position = new Position({
        x: CartesianTools.DEFAULT_SCALE,
        y: CartesianTools.DEFAULT_SCALE,
    });

    it('getMatrix/getMatrixByName should find and return null when not found', () => {
        const m1 = new SpeedMatrix(
            '0',
            'r',
            [],
            {angleInDegrees: 0, pixelsPerPeriod: 0},
            1,
            smallRange,
            roundScale
        );
        const m2 = new SpeedMatrix(
            '5',
            'r',
            [],
            {angleInDegrees: 0, pixelsPerPeriod: 0},
            1,
            smallRange,
            roundScale
        );
        const c = new SpeedMatrixContainer({matrices: [m1, m2]});

        expect(c.getMatrix(0)).to.equal(m1);
        expect(c.getMatrix(1)).to.equal(m2);
        expect(c.getMatrix(2)).to.equal(null);

        expect(c.getMatrixByName('0')).to.equal(m1);
        expect(c.getMatrixByName('5')).to.equal(m2);
        expect(c.getMatrixByName('X')).to.equal(null);
    });

    it('getTrustedIndicators should cache values and isConsistent should use average threshold', () => {
        const m1 = new SpeedMatrix('0', '', [], undefined, 0.6, smallRange, roundScale);
        const m2 = new SpeedMatrix('1', '', [], undefined, 0.4, smallRange, roundScale);
        const c = new SpeedMatrixContainer({matrices: [m1, m2]});

        const first = c.getTrustedIndicators();
        const second = c.getTrustedIndicators();
        expect(first).to.equal(second); // cached reference
        expect(first).to.deep.equal([0.6, 0.4]);
        // average is 0.5; consistency requires > 0.5, so false
        expect(c.isConsistent()).to.equal(false);

        const c2 = new SpeedMatrixContainer({
            matrices: [new SpeedMatrix('2', '', [], undefined, 0.51, smallRange, roundScale)],
        });
        expect(c2.isConsistent()).to.equal(true);
    });

    it('renderFlattenMatrix should return normalized values and getFlattenMatrixCount should reflect stored matrices', () => {
        const qp = buildQP('g1', 10, 10);
        const m = new SpeedMatrix('0', '', [qp], undefined, 1, smallRange, roundScale);
        const c = new SpeedMatrixContainer({matrices: [m]});

        // Initially no flatten matrices stored
        expect(c.getFlattenMatrixCount()).to.equal(0);

        // Trigger storing via getQualityPoints (called by render)
        const renderedNoReNorm = c.renderFlattenMatrix(0, {normalize: false});
        expect(renderedNoReNorm.length).to.equal(
            Math.pow(smallRange.xMax - smallRange.xMin + 1, 2)
        );
        // Since store uses normalized=true, max should be 1 already
        const maxValue = Math.max(...renderedNoReNorm.map((p) => p.value));
        expect(maxValue).to.equal(1);

        // With normalize=true, still normalized
        const renderedNorm = c.renderFlattenMatrix(0, {normalize: true});
        const maxValue2 = Math.max(...renderedNorm.map((p) => p.value));
        expect(maxValue2).to.equal(1);

        expect(c.getFlattenMatrixCount()).to.equal(1);
    });

    it('toJSON options should remove properties accordingly', () => {
        const c = new SpeedMatrixContainer({matrices: []});
        const base = c.toJSON();
        expect(base).to.have.property('flattenMatrices');
        expect(base).to.have.property('matrices');
        expect(base).to.have.property('trustedIndicators');

        const noFlatten = c.toJSON({removeFlatten: true});
        expect(noFlatten).to.not.have.property('flattenMatrices');

        const noMatrices = c.toJSON({removeMatrices: true});
        expect(noMatrices).to.not.have.property('matrices');

        const noIndicators = c.toJSON({removeIndicators: true});
        expect(noIndicators).to.not.have.property('trustedIndicators');
    });

    it('BuildCompares should keep duplicates when removeDuplicates=false', () => {
        const dateBase = new Date(10 * 60 * 1000); // 10 minutes
        const gDate = new Date(8 * 60 * 1000);
        const rDate = new Date(9 * 60 * 1000);

        // Two points with same gaugeId/date but different values (different deltas)
        const qp1a = buildQP('gid', 10, 12, {g: gDate, r: rDate});
        const qp1b = buildQP('gid', 11, 12, {g: gDate, r: rDate});

        const mA = new SpeedMatrix('0', '', [qp1a], undefined, 1, smallRange, roundScale);
        const mB = new SpeedMatrix('1', '', [qp1b], undefined, 1, smallRange, roundScale);

        const rcq1 = new RainComputationQuality({
            id: 'rcqA',
            date: dateBase,
            isReady: true,
            qualitySpeedMatrixContainer: new SpeedMatrixContainer({matrices: [mA, mB]}),
        });
        const rcq2 = new RainComputationQuality({
            id: 'rcqB',
            date: new Date(dateBase.getTime() + 2 * 60 * 1000), // +2 minutes expands window
            isReady: true,
            qualitySpeedMatrixContainer: new SpeedMatrixContainer({matrices: [mA, mB]}),
        });

        const comparesNoDedup = SpeedMatrixContainer.BuildCompares([rcq1, rcq2], false);
        expect(comparesNoDedup.comparesPerDate.length).to.equal(2);
        // sum all quality points across all timelines/dates
        const totalNoDedup = comparesNoDedup.comparesPerDate.reduce(
            (sum, cpd) => sum + cpd.compareTimeline.reduce((s, t) => s + t.qualityPoints.length, 0),
            0
        );
        expect(totalNoDedup).to.equal(3); // rcq1 contributes 1 (delta 0), rcq2 contributes 2 (delta 0 and 1)

        const comparesDedup = SpeedMatrixContainer.BuildCompares([rcq1, rcq2], true);
        const totalDedup = comparesDedup.comparesPerDate.reduce(
            (sum, cpd) => sum + cpd.compareTimeline.reduce((s, t) => s + t.qualityPoints.length, 0),
            0
        );
        expect(totalDedup).to.equal(1);
    });

    describe('getQuality with normalize option', () => {
        it('should return raw value by default', () => {
            const qp1 = buildQP('g1', 10, 15); // delta = 5
            const qp2 = buildQP('g2', 20, 16); // delta = 4
            const m = new SpeedMatrix('0', '', [qp1, qp2], undefined, 1, smallRange, roundScale);
            const c = new SpeedMatrixContainer({matrices: [m]});

            // Raw DELTA = (5 + 4) / 2 = 4.5
            const rawDelta = c.getQuality(undefined, {method: QualityIndicatorMethod.DELTA});
            expect(rawDelta).to.equal(4.5);
        });

        it('should return normalized value when normalize=true', () => {
            const qp1 = buildQP('g1', 10, 15); // delta = 5
            const qp2 = buildQP('g2', 20, 16); // delta = 4
            const m = new SpeedMatrix('0', '', [qp1, qp2], undefined, 1, smallRange, roundScale);
            const c = new SpeedMatrixContainer({matrices: [m]});

            // Raw DELTA = 4.5, normalized = 100 - (4.5/10)*100 = 55
            const normalizedDelta = c.getQuality(undefined, {
                method: QualityIndicatorMethod.DELTA,
                normalize: true,
            });
            expect(normalizedDelta).to.equal(55);
        });

        it('should return 100 for perfect predictions when normalized', () => {
            const qp1 = buildQP('g1', 10, 10);
            const qp2 = buildQP('g2', 20, 20);
            const m = new SpeedMatrix('0', '', [qp1, qp2], undefined, 1, smallRange, roundScale);
            const c = new SpeedMatrixContainer({matrices: [m]});

            const methods = [
                QualityIndicatorMethod.DELTA,
                QualityIndicatorMethod.RATIO,
                QualityIndicatorMethod.SUCCESS_RATE,
                QualityIndicatorMethod.RMSE,
                QualityIndicatorMethod.MAPE,
                QualityIndicatorMethod.NASH_SUTCLIFFE,
            ];

            for (const method of methods) {
                const normalized = c.getQuality(undefined, {method, normalize: true});
                expect(normalized).to.equal(100, `${method} should return 100 for perfect`);
            }
        });

        it('should use custom normalization options', () => {
            const qp1 = buildQP('g1', 10, 15); // delta = 5
            const qp2 = buildQP('g2', 20, 16); // delta = 4
            const m = new SpeedMatrix('0', '', [qp1, qp2], undefined, 1, smallRange, roundScale);
            const c = new SpeedMatrixContainer({matrices: [m]});

            // Raw DELTA = 4.5, with maxRef=20: normalized = 100 - (4.5/20)*100 = 77.5
            const normalized = c.getQuality(undefined, {
                method: QualityIndicatorMethod.DELTA,
                normalize: true,
                normalizationOptions: {deltaMaxRef: 20},
            });
            expect(normalized).to.equal(77.5);
        });

        it('should work with all methods', () => {
            const qp1 = buildQP('g1', 10, 12);
            const qp2 = buildQP('g2', 20, 18);
            const m = new SpeedMatrix('0', '', [qp1, qp2], undefined, 1, smallRange, roundScale);
            const c = new SpeedMatrixContainer({matrices: [m]});

            const methods = [
                QualityIndicatorMethod.DELTA,
                QualityIndicatorMethod.RATIO,
                QualityIndicatorMethod.SUCCESS_RATE,
                QualityIndicatorMethod.RMSE,
                QualityIndicatorMethod.MAPE,
                QualityIndicatorMethod.NASH_SUTCLIFFE,
            ];

            for (const method of methods) {
                const normalized = c.getQuality(undefined, {method, normalize: true});
                expect(normalized).to.be.at.least(0, `${method} should be >= 0`);
                expect(normalized).to.be.at.most(100, `${method} should be <= 100`);
            }
        });
    });
});
