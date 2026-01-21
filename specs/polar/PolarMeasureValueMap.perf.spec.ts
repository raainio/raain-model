import {expect} from 'chai';
import {MeasureValuePolarContainer, PolarMeasureValue, PolarMeasureValueMap} from '../../src';

describe('PolarMeasureValueMap Performance', () => {
    const azTotal = 720;
    const edgeTotal = 1832; // Match real radar data size
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

    it('should compare iteration performance: full vs sparse data', function () {
        this.timeout(60000);
        console.log('\n=== PolarMeasureValueMap Iteration Performance Comparison ===');
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

    it('should compare callback optimization: original vs optimized', function () {
        this.timeout(60000);
        console.log('\n=== Callback Optimization Comparison ===\n');

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

        console.log('| Version         | Time (ms) | CallCount | Speedup |');
        console.log('|-----------------|-----------|-----------|---------|');
        console.log(
            `| Original        | ${originalTime.toFixed(2).padStart(9)} | ${(1319040).toString().padStart(9)} |    -    |`
        );
        console.log(
            `| Optimized       | ${optimizedTime.toFixed(2).padStart(9)} | ${(1319040).toString().padStart(9)} | ${speedup1.toFixed(1).padStart(5)}x  |`
        );
        console.log(
            `| Direct (no cb)  | ${directTime.toFixed(2).padStart(9)} | ${directCallCount.toString().padStart(9)} | ${speedup2.toFixed(1).padStart(5)}x  |`
        );
        console.log(`\nWith ~7% non-zero values (gaugeFocus simulation)`);

        expect(optimizedTime).to.be.lessThan(originalTime);
        expect(directTime).to.be.lessThan(optimizedTime);
    });

    it('should skip zeros with minExcludedValue option', function () {
        this.timeout(60000);
        console.log('\n=== minExcludedValue Option Test ===\n');

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

        expect(callCount2).to.be.lessThan(callCount1);
        expect(time2).to.be.lessThan(time1);
    });
});
