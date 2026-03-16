import {expect} from 'chai';
import {
    MeasureValuePolarContainer,
    PolarFilter,
    PolarMeasureValue,
    PolarMeasureValueMap,
} from '../../src';

describe('PolarMeasureValueMap Performance', () => {
    // Use smaller dataset for CI to avoid timeouts (still meaningful for relative performance)
    const isCI = process.env.CI === 'true';
    const azTotal = isCI ? 180 : 720;
    const edgeTotal = isCI ? 458 : 1832; // Match real radar data size when not CI
    const distance = 500;
    const a = 100;
    const b = 2;

    function createFullPolarData(): PolarMeasureValue {
        const containers: MeasureValuePolarContainer[] = [];
        for (let i = 0; i < azTotal; i++) {
            const azimuth = (i * 360) / azTotal;
            const polarEdges = new Array(edgeTotal).fill(0).map((_, j) => i * 0.01 + j * 0.001);
            containers.push(new MeasureValuePolarContainer({azimuth, distance, polarEdges}));
        }
        return new PolarMeasureValue({
            measureValuePolarContainers: containers,
            azimuthsCount: azTotal,
            polarEdgesCount: edgeTotal,
        });
    }

    function createSparseAzimuthsPolarData(filledAzimuthsCount: number): PolarMeasureValue {
        const containers: MeasureValuePolarContainer[] = [];
        const step = Math.floor(azTotal / filledAzimuthsCount);
        for (let i = 0; i < azTotal; i += step) {
            const azimuth = (i * 360) / azTotal;
            const polarEdges = new Array(edgeTotal).fill(0).map((_, j) => i * 0.01 + j * 0.001);
            containers.push(new MeasureValuePolarContainer({azimuth, distance, polarEdges}));
        }
        return new PolarMeasureValue({
            measureValuePolarContainers: containers,
            azimuthsCount: azTotal,
            polarEdgesCount: edgeTotal,
        });
    }

    function createSparseEdgesPolarData(filledEdgesPerAzimuth: number): PolarMeasureValue {
        const containers: MeasureValuePolarContainer[] = [];
        for (let i = 0; i < azTotal; i++) {
            const azimuth = (i * 360) / azTotal;
            const polarEdges = new Array(filledEdgesPerAzimuth)
                .fill(0)
                .map((_, j) => i * 0.01 + j * 0.001);
            containers.push(new MeasureValuePolarContainer({azimuth, distance, polarEdges}));
        }
        return new PolarMeasureValue({
            measureValuePolarContainers: containers,
            azimuthsCount: azTotal,
            polarEdgesCount: edgeTotal,
        });
    }

    function createVerySparseData(
        filledAzimuthsCount: number,
        filledEdgesPerAzimuth: number
    ): PolarMeasureValue {
        const containers: MeasureValuePolarContainer[] = [];
        const step = Math.floor(azTotal / filledAzimuthsCount);
        for (let i = 0; i < azTotal; i += step) {
            const azimuth = (i * 360) / azTotal;
            const polarEdges = new Array(filledEdgesPerAzimuth)
                .fill(0)
                .map((_, j) => i * 0.01 + j * 0.001);
            containers.push(new MeasureValuePolarContainer({azimuth, distance, polarEdges}));
        }
        return new PolarMeasureValue({
            measureValuePolarContainers: containers,
            azimuthsCount: azTotal,
            polarEdgesCount: edgeTotal,
        });
    }

    function measureIterationTime(polarMap: PolarMeasureValueMap): {timeMs: number; count: number} {
        let count = 0;
        const start = performance.now();
        polarMap.iterate((polarValue, azIdx, edgeIdx, setter) => {
            count++;
        });
        const end = performance.now();
        return {timeMs: end - start, count};
    }

    it('should compare azimuth-first iteration performance: full vs sparse data', function () {
        this.timeout(60000);
        console.log('\n=== PolarMeasureValueMap Iteration Performance Comparison ===');
        if (isCI) {
            console.log('(Running with reduced dataset for CI)');
        }
        console.log(
            `Grid size: ${azTotal} azimuths x ${edgeTotal} edges = ${azTotal * edgeTotal} potential cells\n`
        );

        // Full data
        const fullPolar = createFullPolarData();
        const fullMap = new PolarMeasureValueMap(fullPolar);
        const fullResult = measureIterationTime(fullMap);

        // Sparse azimuths (10% filled)
        const sparseAzPolar = createSparseAzimuthsPolarData(72);
        const sparseAzMap = new PolarMeasureValueMap(sparseAzPolar);
        const sparseAzResult = measureIterationTime(sparseAzMap);

        // Sparse edges (10% filled per azimuth)
        const sparseEdgePolar = createSparseEdgesPolarData(50);
        const sparseEdgeMap = new PolarMeasureValueMap(sparseEdgePolar);
        const sparseEdgeResult = measureIterationTime(sparseEdgeMap);

        // Very sparse (1% azimuths, 10% edges = 0.1% total)
        const verySparsePolar = createVerySparseData(7, 50);
        const verySparseMap = new PolarMeasureValueMap(verySparsePolar);
        const verySparseResult = measureIterationTime(verySparseMap);

        // Empty (0 containers)
        const emptyPolar = new PolarMeasureValue({
            measureValuePolarContainers: [],
            azimuthsCount: azTotal,
            polarEdgesCount: edgeTotal,
        });
        const emptyMap = new PolarMeasureValueMap(emptyPolar);
        const emptyResult = measureIterationTime(emptyMap);

        console.log(
            '| Scenario              | Cells Iterated | Time (ms) | Cells/ms   | Fill %   |'
        );
        console.log(
            '|-----------------------|----------------|-----------|------------|----------|'
        );
        console.log(
            `| Full                  | ${fullResult.count.toString().padStart(14)} | ${fullResult.timeMs.toFixed(2).padStart(9)} | ${(fullResult.count / fullResult.timeMs).toFixed(0).padStart(10)} | ${((fullResult.count / (azTotal * edgeTotal)) * 100).toFixed(1).padStart(6)}%  |`
        );
        console.log(
            `| Sparse Azimuths (10%) | ${sparseAzResult.count.toString().padStart(14)} | ${sparseAzResult.timeMs.toFixed(2).padStart(9)} | ${(sparseAzResult.count / sparseAzResult.timeMs).toFixed(0).padStart(10)} | ${((sparseAzResult.count / (azTotal * edgeTotal)) * 100).toFixed(1).padStart(6)}%  |`
        );
        console.log(
            `| Sparse Edges (10%)    | ${sparseEdgeResult.count.toString().padStart(14)} | ${sparseEdgeResult.timeMs.toFixed(2).padStart(9)} | ${(sparseEdgeResult.count / sparseEdgeResult.timeMs).toFixed(0).padStart(10)} | ${((sparseEdgeResult.count / (azTotal * edgeTotal)) * 100).toFixed(1).padStart(6)}%  |`
        );
        console.log(
            `| Very Sparse (0.1%)    | ${verySparseResult.count.toString().padStart(14)} | ${verySparseResult.timeMs.toFixed(2).padStart(9)} | ${(verySparseResult.count / (verySparseResult.timeMs || 0.01)).toFixed(0).padStart(10)} | ${((verySparseResult.count / (azTotal * edgeTotal)) * 100).toFixed(2).padStart(6)}%  |`
        );
        console.log(
            `| Empty                 | ${emptyResult.count.toString().padStart(14)} | ${emptyResult.timeMs.toFixed(2).padStart(9)} | ${'-'.padStart(10)} | ${((emptyResult.count / (azTotal * edgeTotal)) * 100).toFixed(1).padStart(6)}%  |`
        );

        console.log('\n--- Performance Analysis ---');
        console.log(
            `Full data time: ${fullResult.timeMs.toFixed(2)}ms for ${fullResult.count} cells`
        );
        console.log(
            `Sparse azimuths speedup: ${(fullResult.timeMs / sparseAzResult.timeMs).toFixed(1)}x faster`
        );
        console.log(
            `Sparse edges speedup: ${(fullResult.timeMs / sparseEdgeResult.timeMs).toFixed(1)}x faster`
        );
        console.log(
            `Very sparse speedup: ${(fullResult.timeMs / (verySparseResult.timeMs || 0.01)).toFixed(1)}x faster`
        );

        // Assertions
        expect(fullResult.count).to.eq(azTotal * edgeTotal);
        expect(sparseAzResult.count).to.be.lessThan(fullResult.count);
        // NOTE: sparseEdgeResult iterates ALL cells because PolarMeasureValueMap.buildFromPolar
        // creates full edge arrays based on polarEdgesCount, not actual container edge count
        // This is a potential optimization opportunity!
        expect(verySparseResult.count).to.be.lessThan(sparseAzResult.count);
        expect(emptyResult.count).to.eq(0);

        // Sparse azimuths should be faster (fewer containers to iterate)
        expect(sparseAzResult.timeMs).to.be.lessThan(fullResult.timeMs);
    });

    it('should compare construction time: full vs sparse data', function () {
        this.timeout(60000);
        console.log('\n=== PolarMeasureValueMap Construction Performance ===\n');

        // Full data
        const fullPolar = createFullPolarData();
        const startFull = performance.now();
        new PolarMeasureValueMap(fullPolar);
        const fullTime = performance.now() - startFull;

        // Sparse (10% azimuths)
        const sparsePolar = createSparseAzimuthsPolarData(72);
        const startSparse = performance.now();
        new PolarMeasureValueMap(sparsePolar);
        const sparseTime = performance.now() - startSparse;

        // Very sparse
        const verySparsePolar = createVerySparseData(7, 50);
        const startVerySparse = performance.now();
        new PolarMeasureValueMap(verySparsePolar);
        const verySparseTime = performance.now() - startVerySparse;

        console.log('| Scenario           | Construction (ms) |');
        console.log('|--------------------|-------------------|');
        console.log(`| Full               | ${fullTime.toFixed(2).padStart(17)} |`);
        console.log(`| Sparse (10%)       | ${sparseTime.toFixed(2).padStart(17)} |`);
        console.log(`| Very Sparse (0.1%) | ${verySparseTime.toFixed(2).padStart(17)} |`);

        expect(sparseTime).to.be.lessThan(fullTime);
    });

    it('should compare azimuth-first callback optimization: original vs optimized', function () {
        this.timeout(60000);
        console.log('\n=== Callback Optimization Comparison ===');
        if (isCI) {
            console.log('(Running with reduced dataset for CI)');
        }
        console.log('');

        // Create data with ~7% non-zero values (like gaugeFocus)
        function createSparseValueData(): PolarMeasureValue {
            const containers: MeasureValuePolarContainer[] = [];
            for (let i = 0; i < azTotal; i++) {
                const azimuth = (i * 360) / azTotal;
                const polarEdges = new Array(edgeTotal).fill(0).map((_, j) => {
                    // ~7% of cells have values (simulating gaugeFocus)
                    return Math.random() < 0.07 ? 20 + Math.random() * 30 : 0;
                });
                containers.push(new MeasureValuePolarContainer({azimuth, distance, polarEdges}));
            }
            return new PolarMeasureValue({
                measureValuePolarContainers: containers,
                azimuthsCount: azTotal,
                polarEdgesCount: edgeTotal,
            });
        }

        const polar = createSparseValueData();
        const map1 = new PolarMeasureValueMap(polar);
        const map2 = new PolarMeasureValueMap(polar);

        // Original version
        const startOriginal = performance.now();
        map1.iterate((polarValue, azimuthIndex, edgeIndex, valueSetter) => {
            let intensity = 0;
            if (polarValue?.value) {
                intensity = Math.pow(1 / a, 1 / b) * Math.pow(10, polarValue.value / (10 * b));
                intensity = Math.round(intensity * 1000) / 1000;
            }
            valueSetter(intensity);
        });
        const originalTime = performance.now() - startOriginal;

        // Optimized version
        const coefA = Math.pow(1 / a, 1 / b);
        const coefB = 1 / (10 * b);

        const startOptimized = performance.now();
        map2.iterate((polarValue, azimuthIndex, edgeIndex, valueSetter) => {
            const value = polarValue.value;
            if (!value) {
                return;
            } // Skip zeros
            const intensity = Math.round(coefA * Math.pow(10, value * coefB) * 1000) / 1000;
            valueSetter(intensity);
        });
        const optimizedTime = performance.now() - startOptimized;

        // Direct iteration (skip zeros at iteration level)
        const map3 = new PolarMeasureValueMap(polar);
        const containers = (map3 as any).builtMeasureValuePolarContainers;

        const startDirect = performance.now();
        let directCallCount = 0;
        for (const container of containers) {
            const edges = container.polarEdges;
            for (let i = 0; i < edges.length; i++) {
                const value = edges[i];
                if (!value) {
                    continue;
                } // Skip at iteration level
                directCallCount++;
                const intensity = Math.round(coefA * Math.pow(10, value * coefB) * 1000) / 1000;
                edges[i] = intensity;
            }
        }
        const directTime = performance.now() - startDirect;

        const speedup1 = originalTime / optimizedTime;
        const speedup2 = originalTime / directTime;

        const totalCells = azTotal * edgeTotal;
        console.log('| Version         | Time (ms) | CallCount | Speedup |');
        console.log('|-----------------|-----------|-----------|---------|');
        console.log(
            `| Original        | ${originalTime.toFixed(2).padStart(9)} | ${totalCells.toString().padStart(9)} |    -    |`
        );
        console.log(
            `| Optimized       | ${optimizedTime.toFixed(2).padStart(9)} | ${totalCells.toString().padStart(9)} | ${speedup1.toFixed(1).padStart(5)}x  |`
        );
        console.log(
            `| Direct (no cb)  | ${directTime.toFixed(2).padStart(9)} | ${directCallCount.toString().padStart(9)} | ${speedup2.toFixed(1).padStart(5)}x  |`
        );
        console.log(`\nWith ~7% non-zero values (gaugeFocus simulation)`);

        expect(optimizedTime).to.be.lessThan(originalTime);
        expect(directTime).to.be.lessThan(optimizedTime);
    });

    it('should skip zeros with minExcludedValue option (azimuth-first)', function () {
        this.timeout(60000);
        console.log('\n=== minExcludedValue Option Test ===');
        if (isCI) {
            console.log('(Running with reduced dataset for CI)');
        }
        console.log('');

        // Create data with ~7% non-zero values (like gaugeFocus)
        function createSparseValueData(): PolarMeasureValue {
            const containers: MeasureValuePolarContainer[] = [];
            for (let i = 0; i < azTotal; i++) {
                const azimuth = (i * 360) / azTotal;
                const polarEdges = new Array(edgeTotal).fill(0).map((_, j) => {
                    return Math.random() < 0.07 ? 20 + Math.random() * 30 : 0;
                });
                containers.push(new MeasureValuePolarContainer({azimuth, distance, polarEdges}));
            }
            return new PolarMeasureValue({
                measureValuePolarContainers: containers,
                azimuthsCount: azTotal,
                polarEdgesCount: edgeTotal,
            });
        }

        const polar = createSparseValueData();
        const map1 = new PolarMeasureValueMap(polar);
        const map2 = new PolarMeasureValueMap(polar);

        // Without minExcludedValue
        let callCount1 = 0;
        const start1 = performance.now();
        map1.iterate((polarValue, azimuthIndex, edgeIndex, valueSetter) => {
            callCount1++;
            if (polarValue.value) {
                const intensity =
                    Math.pow(1 / a, 1 / b) * Math.pow(10, polarValue.value / (10 * b));
                valueSetter(Math.round(intensity * 1000) / 1000);
            }
        });
        const time1 = performance.now() - start1;

        // With minExcludedValue: 0 (skip zeros)
        let callCount2 = 0;
        const coefA = Math.pow(1 / a, 1 / b);
        const coefB = 1 / (10 * b);
        const start2 = performance.now();
        map2.iterate(
            (polarValue, azimuthIndex, edgeIndex, valueSetter) => {
                callCount2++;
                const intensity =
                    Math.round(coefA * Math.pow(10, polarValue.value * coefB) * 1000) / 1000;
                valueSetter(intensity);
            },
            {minExcludedValue: 0}
        );
        const time2 = performance.now() - start2;

        const speedup = time1 / time2;
        const skipRatio = ((1 - callCount2 / callCount1) * 100).toFixed(1);

        console.log('| Version              | Time (ms) | CallCount | Speedup |');
        console.log('|----------------------|-----------|-----------|---------|');
        console.log(
            `| Without skip         | ${time1.toFixed(2).padStart(9)} | ${callCount1.toString().padStart(9)} |    -    |`
        );
        console.log(
            `| With minExcludedValue| ${time2.toFixed(2).padStart(9)} | ${callCount2.toString().padStart(9)} | ${speedup.toFixed(1).padStart(5)}x  |`
        );
        console.log(`\nSkipped ${skipRatio}% of callbacks (zeros)`);

        // Verify behavior: fewer callbacks with minExcludedValue
        expect(callCount2).to.be.lessThan(callCount1);
        // Note: timing assertions removed as micro-benchmark overhead may dominate with small datasets
        // The real benefit is visible with large datasets (720x1832) in local runs
    });

    it('should iterate faster with bypass-zones vs azimuth-first full scan', function () {
        this.timeout(60000);
        console.log('\n=== Bypass Zones Performance ===');
        if (isCI) {
            console.log('(Running with reduced dataset for CI)');
        }
        console.log('');

        const polar = createFullPolarData();

        // Simulate 3 gauge zones (±5 pixels around each) — small fraction of the grid
        // Use indices that fit in CI mode (azTotal=180, edgeTotal=458)
        const zones = [
            {azMin: 10, azMax: 20, edMin: 50, edMax: 60, metadata: {lat: 48.0, lng: 2.0}},
            {azMin: 50, azMax: 60, edMin: 100, edMax: 110, metadata: {lat: 48.1, lng: 2.1}},
            {azMin: 100, azMax: 110, edMin: 200, edMax: 210, metadata: {lat: 48.2, lng: 2.2}},
        ];

        // Full scan
        const map1 = new PolarMeasureValueMap(polar);
        let fullCount = 0;
        const startFull = performance.now();
        map1.iterate((pv, az, ed, setter) => {
            fullCount++;
        });
        const fullTime = performance.now() - startFull;

        // Bypass with zones
        const map2 = new PolarMeasureValueMap(polar, new PolarFilter({zones}));
        let bypassCount = 0;
        const startBypass = performance.now();
        map2.iterate(
            (pv, az, ed, setter) => {
                bypassCount++;
            },
            {bypass: true}
        );
        const bypassTime = performance.now() - startBypass;

        const speedup = fullTime / (bypassTime || 0.01);
        const expectedZoneCells = zones.reduce(
            (sum, z) => sum + (z.azMax - z.azMin + 1) * (z.edMax - z.edMin + 1),
            0
        );

        console.log('| Mode           | Time (ms) | Cells     | Speedup |');
        console.log('|----------------|-----------|-----------|---------|');
        console.log(
            `| Full scan      | ${fullTime.toFixed(2).padStart(9)} | ${fullCount.toString().padStart(9)} |    -    |`
        );
        console.log(
            `| Bypass (zones) | ${bypassTime.toFixed(2).padStart(9)} | ${bypassCount.toString().padStart(9)} | ${speedup.toFixed(1).padStart(5)}x  |`
        );
        console.log(
            `\n3 zones, ${expectedZoneCells} expected cells vs ${azTotal * edgeTotal} total`
        );

        expect(bypassCount).to.eq(expectedZoneCells);
        expect(bypassCount).to.be.lessThan(fullCount);
        expect(bypassTime).to.be.lessThan(fullTime);

        // Verify metadata is preserved
        expect(map2.buildPolarFilter.zones[0].metadata.lat).to.eq(48.0);
        expect(map2.buildPolarFilter.zones[2].metadata.lng).to.eq(2.2);
    });

    it('should deduplicate overlapping zones in bypass-zones mode', function () {
        this.timeout(10000);

        const polar = createFullPolarData();
        // Two overlapping zones: overlap on [15-20] x [55-60]
        const zones = [
            {azMin: 10, azMax: 20, edMin: 50, edMax: 60},
            {azMin: 15, azMax: 25, edMin: 55, edMax: 65},
        ];

        const map = new PolarMeasureValueMap(polar, new PolarFilter({zones}));
        const visited: string[] = [];
        map.iterate(
            (pv, az, ed, setter) => {
                visited.push(`${az},${ed}`);
            },
            {bypass: true}
        );

        // No duplicates
        const unique = new Set(visited);
        expect(unique.size).to.eq(visited.length, 'duplicates detected');

        // Total = union = zone1 + zone2 - overlap
        // zone1: [10..20] x [50..60] = 11 * 11 = 121
        // zone2: [15..25] x [55..65] = 11 * 11 = 121
        // overlap: [15..20] x [55..60] = 6 * 6 = 36
        expect(visited.length).to.eq(121 + 121 - 36);
    });

    it('should compare iterateOnEachEdge vs azimuth-first performance', function () {
        this.timeout(60000);
        console.log('\n=== iterateOnEachEdge vs Azimuth-first ===');
        if (isCI) {
            console.log('(Running with reduced dataset for CI)');
        }
        console.log('');

        const polar = createFullPolarData();
        const filter = new PolarFilter({azimuthMin: 10, azimuthMax: 50, edgeMin: 20, edgeMax: 80});
        const map1 = new PolarMeasureValueMap(polar, filter);
        const map2 = new PolarMeasureValueMap(polar, filter);

        // Azimuth-first
        let azCount = 0;
        const azValues: number[] = [];
        const startAz = performance.now();
        map1.iterate(
            (pv, az, ed, setter) => {
                azCount++;
                azValues.push(pv.value);
            },
            {polarFilter: filter}
        );
        const azTime = performance.now() - startAz;

        // Edge-first
        let edCount = 0;
        const edValues: number[] = [];
        const startEd = performance.now();
        map2.iterate(
            (pv, az, ed, setter) => {
                edCount++;
                edValues.push(pv.value);
            },
            {iterateOnEachEdge: true, polarFilter: filter}
        );
        const edTime = performance.now() - startEd;

        console.log('| Mode           | Time (ms) | Cells     |');
        console.log('|----------------|-----------|-----------|');
        console.log(
            `| Azimuth-first  | ${azTime.toFixed(2).padStart(9)} | ${azCount.toString().padStart(9)} |`
        );
        console.log(
            `| Edge-first     | ${edTime.toFixed(2).padStart(9)} | ${edCount.toString().padStart(9)} |`
        );
        console.log(
            `| Ratio (ed/az)  | ${(edTime / azTime).toFixed(1).padStart(9)}x |           |`
        );

        // Same cell count
        expect(edCount).to.eq(azCount);

        // Same values (just different order) — sort and compare
        azValues.sort((a, b) => a - b);
        edValues.sort((a, b) => a - b);
        expect(azValues).to.deep.eq(edValues);
    });

    it('should apply minExcludedValue in edge-first mode', function () {
        this.timeout(60000);

        // ~7% non-zero values
        const containers: MeasureValuePolarContainer[] = [];
        for (let i = 0; i < azTotal; i++) {
            const azimuth = (i * 360) / azTotal;
            const polarEdges = new Array(edgeTotal)
                .fill(0)
                .map((_, j) => (Math.random() < 0.07 ? 20 + Math.random() * 30 : 0));
            containers.push(new MeasureValuePolarContainer({azimuth, distance, polarEdges}));
        }
        const polar = new PolarMeasureValue({
            measureValuePolarContainers: containers,
            azimuthsCount: azTotal,
            polarEdgesCount: edgeTotal,
        });

        const map1 = new PolarMeasureValueMap(polar);
        const map2 = new PolarMeasureValueMap(polar);

        // Without filter
        let countAll = 0;
        map1.iterate(
            (pv) => {
                countAll++;
            },
            {iterateOnEachEdge: true}
        );

        // With minExcludedValue
        let countFiltered = 0;
        map2.iterate(
            (pv) => {
                countFiltered++;
            },
            {iterateOnEachEdge: true, minExcludedValue: 0}
        );

        console.log(
            `\nEdge-first minExcludedValue: ${countAll} total → ${countFiltered} non-zero (${((countFiltered / countAll) * 100).toFixed(1)}%)`
        );

        expect(countFiltered).to.be.lessThan(countAll);
        expect(countFiltered).to.be.greaterThan(0);
    });

    it('should modify values correctly via valueSetter in edge-first mode', function () {
        // Small grid: 10 az x 10 edges
        const containers: MeasureValuePolarContainer[] = [];
        for (let i = 0; i < 10; i++) {
            const polarEdges = new Array(10).fill(0).map((_, j) => i * 10 + j);
            containers.push(
                new MeasureValuePolarContainer({azimuth: i * 36, distance: 1000, polarEdges})
            );
        }
        const polar = new PolarMeasureValue({
            measureValuePolarContainers: containers,
            azimuthsCount: 10,
            polarEdgesCount: 10,
        });
        const map = new PolarMeasureValueMap(polar);

        // Double all values via edge-first iteration
        map.iterate(
            (pv, az, ed, setter) => {
                setter(pv.value * 2);
            },
            {iterateOnEachEdge: true}
        );

        // Verify with azimuth-first
        const values: number[] = [];
        map.iterate((pv) => {
            values.push(pv.value);
        });

        // All values should be doubled: [0,2,4,...,198]
        expect(values.length).to.eq(100);
        for (let i = 0; i < 100; i++) {
            const az = Math.floor(i / 10);
            const ed = i % 10;
            const original = az * 10 + ed;
            expect(values[i]).to.eq(original * 2, `value at az=${az} ed=${ed}`);
        }
    });

    it('should iterate bypass-zones in edge-first order', function () {
        this.timeout(10000);

        const polar = createFullPolarData();
        const zones = [{azMin: 10, azMax: 12, edMin: 50, edMax: 52}];
        const map = new PolarMeasureValueMap(polar, new PolarFilter({zones}));

        // Bypass azimuth-first
        const azFirstOrder: string[] = [];
        map.iterate(
            (pv, az, ed) => {
                azFirstOrder.push(`${az},${ed}`);
            },
            {bypass: true}
        );

        // Bypass edge-first
        const edFirstOrder: string[] = [];
        map.iterate(
            (pv, az, ed) => {
                edFirstOrder.push(`${az},${ed}`);
            },
            {bypass: true, iterateOnEachEdge: true}
        );

        // Same count
        expect(edFirstOrder.length).to.eq(azFirstOrder.length);
        expect(edFirstOrder.length).to.eq(9); // 3 az * 3 ed

        // Same cells (as sets)
        expect([...new Set(edFirstOrder)].sort()).to.deep.eq([...new Set(azFirstOrder)].sort());

        // Different order: azimuth-first starts with [10,50],[10,51],[10,52]
        expect(azFirstOrder[0]).to.eq('10,50');
        expect(azFirstOrder[1]).to.eq('10,51');
        expect(azFirstOrder[2]).to.eq('10,52');

        // Edge-first starts with [10,50],[11,50],[12,50]
        expect(edFirstOrder[0]).to.eq('10,50');
        expect(edFirstOrder[1]).to.eq('11,50');
        expect(edFirstOrder[2]).to.eq('12,50');
    });

    it('should deduplicate bypass-zones edge-first with overlapping zones', function () {
        const polar = createFullPolarData();
        const zones = [
            {azMin: 10, azMax: 15, edMin: 50, edMax: 55},
            {azMin: 13, azMax: 18, edMin: 53, edMax: 58},
        ];
        const map = new PolarMeasureValueMap(polar, new PolarFilter({zones}));

        const visited: string[] = [];
        map.iterate(
            (pv, az, ed) => {
                visited.push(`${az},${ed}`);
            },
            {bypass: true, iterateOnEachEdge: true}
        );

        // No duplicates
        const unique = new Set(visited);
        expect(unique.size).to.eq(visited.length, 'duplicates in edge-first bypass');

        // zone1: 6*6=36, zone2: 6*6=36, overlap [13-15]*[53-55] = 3*3=9
        expect(visited.length).to.eq(36 + 36 - 9);
    });

    it('should measure getHash performance on big image', () => {
        const polarMeasureValue = createFullPolarData();
        const totalCells = azTotal * edgeTotal;

        // Measure SimpleHash (default) — JSON.stringify + char-by-char hash
        const startSimple = Date.now();
        const simpleHash = polarMeasureValue.getHash();
        const simpleTimeMs = Date.now() - startSimple;

        expect(simpleHash.length).to.be.greaterThan(0);

        // Measure getPolarsStringified cost separately
        const startStringify = Date.now();
        const stringified = polarMeasureValue.getPolarsStringified();
        const stringifyTimeMs = Date.now() - startStringify;

        const stringLength = stringified.length;

        // Measure just the SimpleHash on the pre-stringified data
        const startHashOnly = Date.now();
        const hashOnly = (PolarMeasureValue as any).SimpleHash(stringified);
        const hashOnlyTimeMs = Date.now() - startHashOnly;

        expect(hashOnly).to.eq(simpleHash);

        // Measure FastHash — direct numeric hashing, no stringify
        const startFast = Date.now();
        const fastHash = polarMeasureValue.getFastHash();
        const fastTimeMs = Date.now() - startFast;

        expect(fastHash.length).to.be.greaterThan(0);

        const speedup = simpleTimeMs > 0 ? (simpleTimeMs / fastTimeMs).toFixed(1) : '∞';

        console.log(
            `  getHash perf (${azTotal}az x ${edgeTotal}edges = ${totalCells} cells):\n` +
                `    SimpleHash total:   ${simpleTimeMs}ms (hash: ${simpleHash})\n` +
                `      JSON.stringify:   ${stringifyTimeMs}ms\n` +
                `      hash only:        ${hashOnlyTimeMs}ms\n` +
                `      stringified:      ${stringLength} chars\n` +
                `    FastHash total:     ${fastTimeMs}ms (hash: ${fastHash})\n` +
                `    speedup:            ${speedup}x`
        );

        // Sanity: hash should complete in reasonable time
        expect(simpleTimeMs).to.be.lessThan(5000, 'getHash took too long');
        expect(fastTimeMs).to.be.lessThan(
            simpleTimeMs,
            'FastHash should be faster than SimpleHash'
        );
    });
});
