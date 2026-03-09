import {expect} from 'chai';
import {
    MeasureValuePolarContainer,
    PolarFilter,
    PolarMeasureValue,
    PolarMeasureValueMap,
} from '../../src';

describe('PolarMeasureValueMap.buildPolarFilterFromMinValue', () => {
    function createMap(
        azCount: number,
        edgeCount: number,
        edgeValueFn: (az: number, ed: number) => number,
        distance = 500
    ): PolarMeasureValueMap {
        const containers: MeasureValuePolarContainer[] = [];
        for (let i = 0; i < azCount; i++) {
            const azimuth = (i * 360) / azCount;
            const polarEdges = new Array(edgeCount).fill(0).map((_, j) => edgeValueFn(i, j));
            containers.push(new MeasureValuePolarContainer({azimuth, distance, polarEdges}));
        }
        const pmv = new PolarMeasureValue({
            measureValuePolarContainers: containers,
            azimuthsCount: azCount,
            polarEdgesCount: edgeCount,
        });
        return new PolarMeasureValueMap(pmv);
    }

    it('should return empty filter when all values are zero', () => {
        const map = createMap(10, 10, () => 0);
        const filter = map.buildPolarFilterFromMinValue(0);
        expect(filter.zones).to.have.length(0);
    });

    it('should return empty filter when all values are below minValue', () => {
        const map = createMap(10, 10, () => 0.5);
        const filter = map.buildPolarFilterFromMinValue(1);
        expect(filter.zones).to.have.length(0);
    });

    it('should use default minValue of 0', () => {
        const map = createMap(4, 4, (az, ed) => (az === 1 && ed === 2 ? 5 : 0));
        const filter = map.buildPolarFilterFromMinValue();
        expect(filter.zones).to.have.length(1);
        expect(filter.zones[0]).to.deep.equal({azMin: 1, azMax: 1, edMin: 2, edMax: 2});
    });

    it('should merge consecutive edges into a single zone per azimuth', () => {
        // Az 0: edges 2,3,4 are above threshold
        const map = createMap(4, 8, (az, ed) => {
            if (az === 0 && ed >= 2 && ed <= 4) {
                return 10;
            }
            return 0;
        });
        const filter = map.buildPolarFilterFromMinValue(0);
        expect(filter.zones).to.have.length(1);
        expect(filter.zones[0]).to.deep.equal({azMin: 0, azMax: 0, edMin: 2, edMax: 4});
    });

    it('should create separate zones for non-consecutive edge runs', () => {
        // Az 0: edges 1-2 and 5-6 above threshold (gap at 3-4)
        const map = createMap(4, 8, (az, ed) => {
            if (az === 0 && (ed === 1 || ed === 2)) {
                return 10;
            }
            if (az === 0 && (ed === 5 || ed === 6)) {
                return 10;
            }
            return 0;
        });
        const filter = map.buildPolarFilterFromMinValue(0);
        const az0Zones = filter.zones.filter((z) => z.azMin === 0);
        expect(az0Zones).to.have.length(2);
        expect(az0Zones[0]).to.deep.equal({azMin: 0, azMax: 0, edMin: 1, edMax: 2});
        expect(az0Zones[1]).to.deep.equal({azMin: 0, azMax: 0, edMin: 5, edMax: 6});
    });

    it('should create multiple zones on the same azimuth with 3+ distinct runs', () => {
        // Az 2: three separate runs — edges 0-1, 4-5, 9 (gaps at 2-3 and 6-8)
        // Az 5: two runs — edges 3-6, 10-11
        const map = createMap(8, 12, (az, ed) => {
            if (az === 2) {
                if (ed <= 1) {
                    return 3;
                }
                if (ed >= 4 && ed <= 5) {
                    return 7;
                }
                if (ed === 9) {
                    return 1;
                }
            }
            if (az === 5) {
                if (ed >= 3 && ed <= 6) {
                    return 4;
                }
                if (ed >= 10 && ed <= 11) {
                    return 9;
                }
            }
            return 0;
        });
        const filter = map.buildPolarFilterFromMinValue(0);

        const az2Zones = filter.zones.filter((z) => z.azMin === 2);
        expect(az2Zones).to.have.length(3);
        expect(az2Zones[0]).to.deep.equal({azMin: 2, azMax: 2, edMin: 0, edMax: 1});
        expect(az2Zones[1]).to.deep.equal({azMin: 2, azMax: 2, edMin: 4, edMax: 5});
        expect(az2Zones[2]).to.deep.equal({azMin: 2, azMax: 2, edMin: 9, edMax: 9});

        const az5Zones = filter.zones.filter((z) => z.azMin === 5);
        expect(az5Zones).to.have.length(2);
        expect(az5Zones[0]).to.deep.equal({azMin: 5, azMax: 5, edMin: 3, edMax: 6});
        expect(az5Zones[1]).to.deep.equal({azMin: 5, azMax: 5, edMin: 10, edMax: 11});

        // Total zones: 3 (az2) + 2 (az5) = 5
        expect(filter.zones).to.have.length(5);
    });

    it('should handle zones across multiple azimuths', () => {
        // Az 0: edge 0 above, Az 2: edge 3 above
        const map = createMap(4, 5, (az, ed) => {
            if (az === 0 && ed === 0) {
                return 5;
            }
            if (az === 2 && ed === 3) {
                return 7;
            }
            return 0;
        });
        const filter = map.buildPolarFilterFromMinValue(0);
        expect(filter.zones).to.have.length(2);
        expect(filter.zones[0]).to.deep.equal({azMin: 0, azMax: 0, edMin: 0, edMax: 0});
        expect(filter.zones[1]).to.deep.equal({azMin: 2, azMax: 2, edMin: 3, edMax: 3});
    });

    it('should handle trailing run at end of edges', () => {
        // Az 1: last 3 edges (5,6,7) are above threshold
        const map = createMap(3, 8, (az, ed) => {
            if (az === 1 && ed >= 5) {
                return 10;
            }
            return 0;
        });
        const filter = map.buildPolarFilterFromMinValue(0);
        expect(filter.zones).to.have.length(1);
        expect(filter.zones[0]).to.deep.equal({azMin: 1, azMax: 1, edMin: 5, edMax: 7});
    });

    it('should handle all values above threshold', () => {
        const map = createMap(3, 4, () => 10);
        const filter = map.buildPolarFilterFromMinValue(0);
        // One zone per azimuth, each spanning all edges
        expect(filter.zones).to.have.length(3);
        for (let az = 0; az < 3; az++) {
            expect(filter.zones[az]).to.deep.equal({azMin: az, azMax: az, edMin: 0, edMax: 3});
        }
    });

    it('should respect minValue threshold strictly (> not >=)', () => {
        // All values are exactly 5, minValue is 5 => nothing above
        const map = createMap(3, 3, () => 5);
        const filter = map.buildPolarFilterFromMinValue(5);
        expect(filter.zones).to.have.length(0);

        // minValue 4.99 => all above
        const filter2 = map.buildPolarFilterFromMinValue(4.99);
        expect(filter2.zones).to.have.length(3);
    });

    it('should work with a pre-filtered map (buildPolarFilter with offset)', () => {
        // Build a full map, then filter to azimuth 2-5, edge 3-7
        const azCount = 10;
        const edgeCount = 10;
        const containers: MeasureValuePolarContainer[] = [];
        for (let i = 0; i < azCount; i++) {
            const azimuth = (i * 360) / azCount;
            const polarEdges = new Array(edgeCount).fill(0).map((_, j) => {
                // Put values > 0 at specific absolute positions
                if (i === 3 && j === 5) {
                    return 8;
                }
                if (i === 4 && j >= 4 && j <= 6) {
                    return 12;
                }
                return 0;
            });
            containers.push(new MeasureValuePolarContainer({azimuth, distance: 500, polarEdges}));
        }
        const pmv = new PolarMeasureValue({
            measureValuePolarContainers: containers,
            azimuthsCount: azCount,
            polarEdgesCount: edgeCount,
        });

        const polarFilter = new PolarFilter({azimuthMin: 2, azimuthMax: 5, edgeMin: 3, edgeMax: 7});
        const map = new PolarMeasureValueMap(pmv, polarFilter);
        const filter = map.buildPolarFilterFromMinValue(0);

        // Should find az=3 ed=5 and az=4 ed=4-6 (absolute indices)
        expect(filter.zones.length).to.be.greaterThan(0);

        const az3 = filter.zones.filter((z) => z.azMin === 3);
        expect(az3).to.have.length(1);
        expect(az3[0].edMin).to.equal(5);
        expect(az3[0].edMax).to.equal(5);

        const az4 = filter.zones.filter((z) => z.azMin === 4);
        expect(az4).to.have.length(1);
        expect(az4[0].edMin).to.equal(4);
        expect(az4[0].edMax).to.equal(6);
    });

    it('should produce a filter usable for bypass iteration', () => {
        // Create data with some values above threshold
        const map = createMap(10, 20, (az, ed) => {
            if (az >= 3 && az <= 5 && ed >= 8 && ed <= 12) {
                return 10;
            }
            return 0;
        });

        const filter = map.buildPolarFilterFromMinValue(0);
        expect(filter.zones.length).to.be.greaterThan(0);

        // Use the filter for bypass iteration
        const collected: {az: number; ed: number; val: number}[] = [];
        const dup = map.duplicate(filter);
        dup.buildPolarFilter = filter;
        dup.iterate(
            (pv, azIdx, edIdx) => {
                collected.push({az: azIdx, ed: edIdx, val: pv.value});
            },
            {bypass: true}
        );

        // All collected values should be > 0
        expect(collected.length).to.equal(3 * 5); // 3 azimuths × 5 edges
        for (const c of collected) {
            expect(c.val).to.equal(10);
            expect(c.az).to.be.within(3, 5);
            expect(c.ed).to.be.within(8, 12);
        }
    });
});
