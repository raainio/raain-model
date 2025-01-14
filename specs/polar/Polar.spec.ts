import {expect} from 'chai';
import {MeasureValuePolarContainer, PolarFilter, PolarMeasureValue, PolarMeasureValueMap, PolarValue} from '../../src';

describe('Polar', () => {

    it('should create ones', () => {

        const polarValue = new PolarValue({value: 12, polarAzimuthInDegrees: 2, polarDistanceInMeters: 4});
        expect(polarValue.value).eq(12);
        expect(polarValue.polarAzimuthInDegrees).eq(2);
        expect(polarValue.polarDistanceInMeters).eq(4);

        const measureValuePolarContainer = new MeasureValuePolarContainer({azimuth: 0, distance: 1000, polarEdges: [33, 45.5]});
        expect(measureValuePolarContainer.polarEdges[0]).eq(33);
        expect(measureValuePolarContainer.polarEdges[1]).eq(45.5);

        const polarMeasureValue = new PolarMeasureValue({
            measureValuePolarContainers: [measureValuePolarContainer],
            azimuthsCount: 720,
            polarEdgesCount: 250
        });
        const polarValueFound = polarMeasureValue.getPolarValue({azimuthInDegrees: 0, distanceInMeters: 2000});
        expect(polarValueFound.value).eq(45.5);
        expect(polarValueFound.polarAzimuthInDegrees).eq(0);
        expect(polarValueFound.polarDistanceInMeters).eq(2000);
        expect(polarMeasureValue.getAzimuthsCount()).eq(720);
        expect(polarMeasureValue.getPolarEdgesCount()).eq(250);

    });

    it('should iterate and filter', () => {

        // some realistic polar setup
        const azTotal = 720;
        const distTotal = 255;
        const measureValuePolarContainers: MeasureValuePolarContainer[] = [];
        let count0 = 0;
        for (let azimuth = 0; azimuth < 360; azimuth += (360 / azTotal)) {
            const values = new Array(5).fill(azimuth);
            const polarEdges = new Array(distTotal).fill(0);
            if ((azimuth + values.length) < polarEdges.length) {
                polarEdges.splice(azimuth, values.length, ...values);
            }
            count0 += polarEdges.length;
            measureValuePolarContainers.push(new MeasureValuePolarContainer({azimuth, distance: 500, polarEdges}));
        }
        expect(count0).eq(azTotal * distTotal);
        const polarMeasureValue = new PolarMeasureValue({measureValuePolarContainers});

        // verify set up
        expect(measureValuePolarContainers[1].getPolarEdgesCount()).eq(255);
        expect(measureValuePolarContainers[1].getNotNullValuesCount()).eq(5);
        expect(polarMeasureValue.getPolarValue({azimuthInDegrees: 3, distanceInMeters: 30 * 500}).value).eq(0);
        const polarValue1 = polarMeasureValue.getPolarValue({azimuthInDegrees: 1, distanceInMeters: 3 * 500});
        expect(polarValue1.value).eq(1);
        expect(polarValue1.polarAzimuthInDegrees).eq(1);
        expect(polarValue1.polarDistanceInMeters).eq(3 * 500);

        // iterate 1) on all 'count1' values, and set a new value for one pixel
        let count1 = 0;
        const onEachValue1 = (polarValue: PolarValue, azimuthIndex: number, edgeIndex: number, valueSetter: (newValue: number) => void) => {
            count1++;
            if (polarValue.polarAzimuthInDegrees === polarValue1.polarAzimuthInDegrees &&
                polarValue.polarDistanceInMeters === polarValue1.polarDistanceInMeters) {

                expect(azimuthIndex).eq(2);
                expect(edgeIndex).eq(2);
                valueSetter(polarValue.value + 10);
            }
        };
        polarMeasureValue.iterate(onEachValue1);

        // verify 1) done
        expect(count1).eq(azTotal * distTotal);
        expect(polarMeasureValue.getAzimuthsCount()).eq(azTotal);
        expect(polarMeasureValue.getPolarEdgesCount()).eq(distTotal);
        expect(polarMeasureValue.getValuesCount()).eq(azTotal * distTotal);
        expect(polarMeasureValue.getNotNullValuesCount()).eq(2495);

        expect(polarMeasureValue.getPolarValue({azimuthInDegrees: 3, distanceInMeters: 30 * 500}).value).eq(0);
        const polarValue2 = polarMeasureValue.getPolarValue({azimuthInDegrees: 1, distanceInMeters: 3 * 500});
        expect(polarValue2.value).eq(polarValue1.value + 10);
        expect(polarValue2.polarAzimuthInDegrees).eq(polarValue1.polarAzimuthInDegrees);
        expect(polarValue2.polarDistanceInMeters).eq(polarValue1.polarDistanceInMeters);

        // filter null values
        const filteredPolarMeasureValue = polarMeasureValue.getFiltered({
            nullValues: true,
            ordered: true
        });
        expect(polarMeasureValue.getHash()).eq('9755238054020');
        expect(filteredPolarMeasureValue.getHash()).eq('8101260843292');

        expect(filteredPolarMeasureValue.getAzimuthsCount()).eq(azTotal);
        expect(filteredPolarMeasureValue.getPolarEdgesCount()).eq(distTotal);
        expect(filteredPolarMeasureValue.getValuesCount()).eq(azTotal * distTotal);
        expect(filteredPolarMeasureValue.getNotNullValuesCount()).eq(2495);

        // iterate 2) on not null 'count2' values, and again set a new value for one pixel
        let count2 = 0;
        const onEachValue2 = (polarValue: PolarValue, azimuthIndex: number, edgeIndex: number, valueSetter: (newValue: number) => void) => {
            count2++;
            if (polarValue.polarAzimuthInDegrees === polarValue1.polarAzimuthInDegrees &&
                polarValue.polarDistanceInMeters === polarValue1.polarDistanceInMeters) {

                expect(azimuthIndex).eq(2);
                expect(edgeIndex).eq(2);
                valueSetter(polarValue.value + 15);
            }
        };
        filteredPolarMeasureValue.iterate(onEachValue2);

        // verify 2) done
        expect(count2).eq(2495);
        expect(filteredPolarMeasureValue.getPolarValue({azimuthInDegrees: 3, distanceInMeters: 30 * 500}).value).eq(0);
        const polarValue3 = filteredPolarMeasureValue.getPolarValue({azimuthInDegrees: 1, distanceInMeters: 3 * 500});
        expect(polarValue3.value).eq(polarValue1.value + 25);
        expect(polarValue3.polarAzimuthInDegrees).eq(polarValue1.polarAzimuthInDegrees);
        expect(polarValue3.polarDistanceInMeters).eq(polarValue1.polarDistanceInMeters);

        // possible set
        filteredPolarMeasureValue.setPolarValue({azimuthInDegrees: 1, distanceInMeters: 3 * 500, value: 123});
        expect(filteredPolarMeasureValue.getPolarValue({azimuthInDegrees: 1, distanceInMeters: 3 * 500}).value).eq(123);

        // not possible set => extending values
        filteredPolarMeasureValue.setPolarValue({azimuthInDegrees: 0, distanceInMeters: 4 * 500, value: 124});
        expect(filteredPolarMeasureValue.getPolarValue({azimuthInDegrees: 0, distanceInMeters: 4 * 500}).value).eq(124);
        filteredPolarMeasureValue.setPolarValue({azimuthInDegrees: 100, distanceInMeters: 5 * 500, value: 125});
        expect(filteredPolarMeasureValue.getPolarValue({azimuthInDegrees: 100, distanceInMeters: 5 * 500}).value).eq(125);
        filteredPolarMeasureValue.setPolarValue({azimuthInDegrees: 100, distanceInMeters: 200 * 500, value: 126});
        expect(filteredPolarMeasureValue.getPolarValue({azimuthInDegrees: 100, distanceInMeters: 200 * 500}).value).eq(126);

    });

    it('should use a map', () => {

        // some realistic polar setup
        const azTotal = 720;
        const distTotal = 255;
        const measureValuePolarContainers: MeasureValuePolarContainer[] = [];
        for (let azimuth = 0; azimuth < 360; azimuth += (360 / azTotal)) {
            const values = new Array(5).fill(azimuth);
            const polarEdges = new Array(distTotal).fill(0);
            if ((azimuth + values.length) < polarEdges.length) {
                polarEdges.splice(azimuth, values.length, ...values);
            }
            measureValuePolarContainers.push(new MeasureValuePolarContainer({azimuth, distance: 500, polarEdges}));
        }
        const polarMeasureValue = new PolarMeasureValue({measureValuePolarContainers});

        // Building Map
        const polarMeasureValueMap = new PolarMeasureValueMap(polarMeasureValue,
            new PolarFilter({azimuthMin: 3, azimuthMax: 30, edgeMin: 2, edgeMax: 100}));

        // Verify Map
        expect(JSON.stringify(polarMeasureValueMap.getPolarValue({
            azimuthIndex: 3,
            edgeIndex: 3
        }))).eq('{"value":1.5,"polarAzimuthInDegrees":1.5,"polarDistanceInMeters":2000}');
        expect(JSON.stringify(polarMeasureValueMap.getPolarValue({
            azimuthIndex: 6,
            edgeIndex: 30
        }))).eq('{"value":0,"polarAzimuthInDegrees":3,"polarDistanceInMeters":15500}');

        // Set Values
        polarMeasureValueMap.setPolarValue({azimuthIndex: 3, edgeIndex: 3, value: 123});
        polarMeasureValueMap.setPolarValue({azimuthIndex: 6, edgeIndex: 30, value: 124});

        // Iterate
        let iterateDone = 0;
        let testDone = 0;
        const onEach = (polarValue: PolarValue,
                        azimuthIndex: number,
                        edgeIndex: number,
                        valueSetter: (newValue: number) => void) => {
            iterateDone++;
            if (polarValue.polarAzimuthInDegrees === 3 &&
                polarValue.polarDistanceInMeters === 15500) {
                expect(azimuthIndex).eq(6);
                expect(edgeIndex).eq(30);
                expect(polarValue.value).eq(124);
                testDone++;
            }
        };

        iterateDone = 0;
        polarMeasureValueMap.iterate(onEach);
        expect(iterateDone).eq(2772);
        expect(testDone).eq(1);

        iterateDone = 0;
        polarMeasureValueMap.iterate(onEach, new PolarFilter({
            azimuthMin: 1,
            azimuthMax: 10,
            edgeMin: 20,
            edgeMax: 40,
        }));
        expect(iterateDone).eq(168);
        expect(testDone).eq(2);

        // Some counts
        expect(polarMeasureValueMap.countPolar()).eq(2828);
        expect(polarMeasureValueMap.countPolarWithEdgeFilter((v) => !!v)).eq(140);

        expect(JSON.stringify(polarMeasureValueMap.getPolarValue({
            azimuthIndex: 3,
            edgeIndex: 3
        }))).eq('{"value":123,"polarAzimuthInDegrees":1.5,"polarDistanceInMeters":2000}');
        expect(JSON.stringify(polarMeasureValueMap.getPolarValue({
            azimuthIndex: 6,
            edgeIndex: 30
        }))).eq('{"value":124,"polarAzimuthInDegrees":3,"polarDistanceInMeters":15500}');

        // Nothing before apply
        expect(JSON.stringify(polarMeasureValue.getPolarValue({
            azimuthInDegrees: 1.5,
            distanceInMeters: 2000
        }))).eq('{"value":1.5,"polarAzimuthInDegrees":1.5,"polarDistanceInMeters":2000}');
        expect(JSON.stringify(polarMeasureValue.getPolarValue({
            azimuthInDegrees: 3,
            distanceInMeters: 15500
        }))).eq('{"value":0,"polarAzimuthInDegrees":3,"polarDistanceInMeters":15500}');

        // Duplicate
        const polarMeasureValueMap2 = polarMeasureValueMap
            .duplicate(new PolarFilter({edgeMin: 1, edgeMax: 30, azimuthMin: 2, azimuthMax: 20}));
        expect(polarMeasureValueMap2.getPolarValue({azimuthIndex: 3, edgeIndex: 3}).polarAzimuthInDegrees).eq(1.5);
        expect(polarMeasureValueMap2.getPolarValue({azimuthIndex: 3, edgeIndex: 3}).polarDistanceInMeters).eq(2000);
        expect(polarMeasureValueMap2.getPolarValue({azimuthIndex: 3, edgeIndex: 3}).value).eq(123);

        // Apply
        polarMeasureValueMap2.applyToPolar();

        // Values applied
        expect(JSON.stringify(polarMeasureValue.getPolarValue({
            azimuthInDegrees: 1.5,
            distanceInMeters: 2000
        }))).eq('{"value":123,"polarAzimuthInDegrees":1.5,"polarDistanceInMeters":2000}');
        expect(JSON.stringify(polarMeasureValue.getPolarValue({
            azimuthInDegrees: 3,
            distanceInMeters: 15500
        }))).eq('{"value":124,"polarAzimuthInDegrees":3,"polarDistanceInMeters":15500}');
    });

});
