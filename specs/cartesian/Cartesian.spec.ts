import {expect} from 'chai';
import {
    CartesianMeasureValue,
    CartesianValue,
    GaugeMeasure,
    GaugeNode,
    ICartesianMeasureValue,
    LatLng,
    RadarCartesianMeasureValue,
    RainCartesianMeasureValue,
    TeamNode,
} from '../../src';

function testValues(
    startLat: number,
    startLng: number,
    latStep: number,
    lngStep: number,
    gridSize: number,
    smallCircleRadius: number,
    bigCircleRadius: number,
    rainCartesianMeasureValue: RainCartesianMeasureValue
) {
    // Helper function to test a point
    const testPoint = (i: number, j: number, expectedValue: number, description: string) => {
        const lat = startLat + i * latStep;
        const lng = startLng + j * lngStep;

        const value = rainCartesianMeasureValue.getCartesianValue({
            lat,
            lng,
        });

        // For points outside both circles, the value can be null or have value 0
        if (expectedValue === 0) {
            if (value === null) {
                // If the point is null, that's acceptable
                return value;
            }
            // If not null, it should have value 0
            expect(value.value, `${description} should have value 0`).to.equal(expectedValue);
        } else {
            // For other points, they should not be null
            expect(value, `${description} should not be null`).to.not.be.null;
            expect(value.value, `${description} should have correct value`).to.equal(expectedValue);
        }

        return value;
    };

    // 1. Test a point inside the small circle (center of small circle)
    const smallCircleCenterI = 10;
    const smallCircleCenterJ = 10;
    const smallCircleCenterValue = smallCircleCenterI * gridSize + smallCircleCenterJ;
    testPoint(
        smallCircleCenterI,
        smallCircleCenterJ,
        smallCircleCenterValue,
        'Small circle center'
    );

    // 2. Test a point inside the big circle (center of big circle)
    const bigCircleCenterI = 40;
    const bigCircleCenterJ = 40;
    const bigCircleCenterValue = bigCircleCenterI * gridSize + bigCircleCenterJ;
    testPoint(bigCircleCenterI, bigCircleCenterJ, bigCircleCenterValue, 'Big circle center');

    // 3. Test a point outside both circles
    const outsidePointI = 70;
    const outsidePointJ = 70;
    testPoint(outsidePointI, outsidePointJ, 0, 'Point outside both circles');

    // 4. Test points at the boundaries of the circles

    // Small circle boundary point (approximately)
    const smallCircleBoundaryI = smallCircleCenterI + Math.floor(smallCircleRadius);
    const smallCircleBoundaryJ = smallCircleCenterJ;
    const smallCircleBoundaryValue = smallCircleBoundaryI * gridSize + smallCircleBoundaryJ;
    testPoint(
        smallCircleBoundaryI,
        smallCircleBoundaryJ,
        smallCircleBoundaryValue,
        'Small circle boundary'
    );

    // Big circle boundary point (approximately)
    const bigCircleBoundaryI = bigCircleCenterI + Math.floor(bigCircleRadius);
    const bigCircleBoundaryJ = bigCircleCenterJ;
    const bigCircleBoundaryValue = bigCircleBoundaryI * gridSize + bigCircleBoundaryJ;
    testPoint(
        bigCircleBoundaryI,
        bigCircleBoundaryJ,
        bigCircleBoundaryValue,
        'Big circle boundary'
    );

    // 5. Test a point just outside the small circle
    const justOutsideSmallCircleI = smallCircleCenterI + Math.ceil(smallCircleRadius) + 1;
    const justOutsideSmallCircleJ = smallCircleCenterJ;
    const justOutsideSmallCircleLat = startLat + justOutsideSmallCircleI * latStep;
    const justOutsideSmallCircleLng = startLng + justOutsideSmallCircleJ * lngStep;

    // Get the value without using the testPoint function since we need to determine
    // the expected value based on whether it's inside the big circle
    const valueJustOutsideSmallCircle = rainCartesianMeasureValue.getCartesianValue({
        lat: justOutsideSmallCircleLat,
        lng: justOutsideSmallCircleLng,
    });

    // Points just outside the small circle can be null, so we need to handle that case
    if (valueJustOutsideSmallCircle === null) {
        // If the value is null, that's acceptable for points just outside the small circle
        return;
    }

    // Calculate distance to big circle to determine expected value
    const distToBigCircle = Math.sqrt(
        Math.pow(justOutsideSmallCircleI - bigCircleCenterI, 2) +
            Math.pow(justOutsideSmallCircleJ - bigCircleCenterJ, 2)
    );

    if (distToBigCircle <= bigCircleRadius) {
        // If it's inside the big circle, it should have a non-zero value
        expect(
            valueJustOutsideSmallCircle.value,
            'Point inside big circle should have correct value'
        ).to.equal(justOutsideSmallCircleI * gridSize + justOutsideSmallCircleJ);
    } else {
        // If it's outside both circles, it should have value 0
        expect(
            valueJustOutsideSmallCircle.value,
            'Point outside both circles should have value 0'
        ).to.equal(0);
    }
}

// Method that removes null (=== 0) values and isolated pixels
function removeNullAndIsolatedValues(rainCartesianMeasureValue: RainCartesianMeasureValue): void {
    // Get all cartesian values
    const cartesianValues = rainCartesianMeasureValue.getCartesianValues();

    // Filter out values where value === 0
    const filteredValues = cartesianValues.filter((value) => value.value !== 0);

    // Remove isolated pixels in the cartesian map
    // An isolated pixel is one that has no neighbors (pixels that are adjacent in lat/lng)
    const nonIsolatedValues = filteredValues.filter((pixel) => {
        // Get the step size from the test (assuming it's consistent)
        const latStep = 0.01;
        const lngStep = 0.01;

        // Check if the pixel has any neighbors
        return filteredValues.some((otherPixel) => {
            // Skip the pixel itself
            if (pixel === otherPixel) {
                return false;
            }

            // Calculate the distance in lat/lng
            const latDiff = Math.abs(pixel.lat - otherPixel.lat);
            const lngDiff = Math.abs(pixel.lng - otherPixel.lng);

            // A neighbor is a pixel that is adjacent in either lat or lng or both
            // This means the difference in lat/lng is approximately equal to the step size
            return (
                (Math.abs(latDiff - latStep) < 0.0001 && lngDiff < 0.0001) || // Adjacent in lat
                (Math.abs(lngDiff - lngStep) < 0.0001 && latDiff < 0.0001) || // Adjacent in lng
                (Math.abs(latDiff - latStep) < 0.0001 && Math.abs(lngDiff - lngStep) < 0.0001) // Adjacent diagonally
            );
        });
    });

    // Set the filtered values back to the object
    rainCartesianMeasureValue.setCartesianValues(nonIsolatedValues);
}

describe('Cartesian', () => {
    it('should create ones', () => {
        const team1 = new TeamNode({
            id: 'tid1',
            name: 'team1',
            description: 'team...',
            contracts: ['basic'],
            contacts: [],
        });
        const cartesianValue1 = new CartesianValue({
            value: 123,
            lat: 10,
            lng: 20,
        });
        const cartesianValue2 = new CartesianValue({
            value: 321,
            lat: 10.002,
            lng: 19.9998,
        });
        const cartesianMeasureValue = new CartesianMeasureValue({
            cartesianValues: [cartesianValue1, cartesianValue2],
        });
        const radarCartesianMeasureValue = new RadarCartesianMeasureValue({
            cartesianValues: [cartesianValue1, cartesianValue2],
            angle: 4,
            axis: 0,
            limitPoints: undefined,
        });
        expect(radarCartesianMeasureValue.angle).eq(4);
        expect(radarCartesianMeasureValue.getCartesianValues().length).eq(2);
        expect(radarCartesianMeasureValue.getLimitPoints({forceCompute: true})[0].lat).eq(10);
        expect(radarCartesianMeasureValue.getLimitPoints()[0].lng).eq(19.9998);
        expect(radarCartesianMeasureValue.getLimitPoints()[1].lat).eq(10.002);
        expect(radarCartesianMeasureValue.getLimitPoints()[1].lng).eq(20);

        const radarCartesianMeasureValue2 = new RadarCartesianMeasureValue(
            radarCartesianMeasureValue.toJSON()
        );
        const radarCartesianMeasureValue3 = new RadarCartesianMeasureValue(
            radarCartesianMeasureValue.toJSONWithCartesianValuesStringified()
        );
        expect(JSON.stringify(radarCartesianMeasureValue2.toJSON())).eq(
            '{"cartesianValues":[{"lat":10,"lng":20,"value":123},{"lat":10.002,"lng":19.9998,"value":321}],"limitPoints":[{"lat":10,"lng":19.9998},{"lat":10.002,"lng":20}],"angle":4,"axis":0}'
        );
        expect(JSON.stringify(radarCartesianMeasureValue3.toJSON())).eq(
            JSON.stringify(radarCartesianMeasureValue.toJSON())
        );

        const gaugeNode = new GaugeNode({
            id: 'GaugeNode looks OK.',
            name: 'name',
            links: [],
            latitude: 1,
            longitude: 1,
            team: team1,
        });
        expect(gaugeNode.id).eq('GaugeNode looks OK.');

        const gaugeMeasure = new GaugeMeasure({
            id: 'gaugeMeasure',
            date: new Date(),
            values: [cartesianMeasureValue],
            validity: 1,
        });
        expect(
            (gaugeMeasure.values[0] as ICartesianMeasureValue).getCartesianValue({lat: 10, lng: 20})
                .value
        ).eq(123);
        expect(
            (gaugeMeasure.values[0] as ICartesianMeasureValue).getCartesianValue({
                lat: 10.0001,
                lng: 20.00001,
            })
        ).eq(null);

        const rainCartesianMeasureValue = new RainCartesianMeasureValue({
            cartesianValues: [cartesianValue1, cartesianValue2],
            version: '',
            limitPoints: [new LatLng({lat: 0, lng: 1}), new LatLng({lat: 12, lng: 20})],
        });
        expect(rainCartesianMeasureValue.getCartesianValues().length).eq(2);
        expect(rainCartesianMeasureValue.getLimitPoints()[0].lat).eq(0);
        expect(rainCartesianMeasureValue.getLimitPoints()[0].lng).eq(1);
        expect(rainCartesianMeasureValue.getLimitPoints()[1].lat).eq(12);
        expect(rainCartesianMeasureValue.getLimitPoints()[1].lng).eq(20);
    });

    it('should create a 100x100 rainCartesianMeasureValue with correct size', () => {
        // Create a 100x100 grid of CartesianValue objects
        const cartesianValues = [];
        const gridSize = 100;

        // Starting coordinates
        const startLat = 10;
        const startLng = 20;

        // Step size for the grid
        const latStep = 0.01;
        const lngStep = 0.01;

        // Define radii for the circles
        const smallCircleRadius = 5;
        const bigCircleRadius = 15;

        // Create the grid
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                const lat = startLat + i * latStep;
                const lng = startLng + j * lngStep;

                // Calculate distances to the centers of the circles
                const distToSmallCircle = Math.sqrt(Math.pow(i - 10, 2) + Math.pow(j - 10, 2));
                const distToBigCircle = Math.sqrt(Math.pow(i - 40, 2) + Math.pow(j - 40, 2));

                // Set value only if the point is within either circle
                let value = 0;
                if (distToSmallCircle <= smallCircleRadius || distToBigCircle <= bigCircleRadius) {
                    value = i * gridSize + j;
                }

                // Only add points with values
                cartesianValues.push(
                    new CartesianValue({
                        value,
                        lat,
                        lng,
                    })
                );
            }
        }

        // Create the RainCartesianMeasureValue with the grid
        const rainCartesianMeasureValue = new RainCartesianMeasureValue({
            cartesianValues,
            version: '1.0',
            limitPoints: [
                new LatLng({lat: startLat, lng: startLng}),
                new LatLng({
                    lat: startLat + (gridSize - 1) * latStep,
                    lng: startLng + (gridSize - 1) * lngStep,
                }),
            ],
        });

        // Verify the size
        expect(rainCartesianMeasureValue.getCartesianValues().length).eq(gridSize * gridSize);

        // Verify the limit points
        const limitPoints = rainCartesianMeasureValue.getLimitPoints();
        expect(limitPoints[0].lat).eq(startLat);
        expect(limitPoints[0].lng).eq(startLng);
        expect(limitPoints[1].lat).eq(startLat + (gridSize - 1) * latStep);
        expect(limitPoints[1].lng).eq(startLng + (gridSize - 1) * lngStep);

        // Verify grid dimensions
        const latDiff = limitPoints[1].lat - limitPoints[0].lat;
        const lngDiff = limitPoints[1].lng - limitPoints[0].lng;

        // Calculate expected number of points in each dimension
        const expectedLatPoints = Math.round(latDiff / latStep) + 1;
        const expectedLngPoints = Math.round(lngDiff / lngStep) + 1;

        expect(expectedLatPoints).eq(gridSize);
        expect(expectedLngPoints).eq(gridSize);

        // Verify the values
        testValues(
            startLat,
            startLng,
            latStep,
            lngStep,
            gridSize,
            smallCircleRadius,
            bigCircleRadius,
            rainCartesianMeasureValue
        );

        // Call the function to remove null values
        removeNullAndIsolatedValues(rainCartesianMeasureValue);

        // verify there is no value changes
        testValues(
            startLat,
            startLng,
            latStep,
            lngStep,
            gridSize,
            smallCircleRadius,
            bigCircleRadius,
            rainCartesianMeasureValue
        );
    });
});
