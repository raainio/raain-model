import {LatLng} from './LatLng';
import {CartesianValue} from './CartesianValue';
import {EarthMap} from './EarthMap';
import {RainNode} from '../rain';

export class CartesianTools {
    // scale of Pixel regarding LatLng : Approx. 1 => 100km, 0.01 => 1km, 0.005 => 500m
    public static DEFAULT_SCALE = 0.01;

    constructor(public scale = CartesianTools.DEFAULT_SCALE) {}

    public static RoundLatLng(
        latOrLng: number,
        scale = CartesianTools.DEFAULT_SCALE,
        needPrecision = false
    ): number {
        const result = Math.round(latOrLng / scale) * scale;
        if (!needPrecision) {
            return result;
        }
        return parseFloat(parseFloat('' + result).toPrecision(12));

        // alternative ?
        // let decimalPlaces = 0;
        // if (('' + scale).indexOf('0.') === 0) {
        //     decimalPlaces = ('' + scale).substring(2).length;
        // } else {
        //     return Math.round(latOrLng / scale) * scale;
        // }
        // const p = Math.pow(10, decimalPlaces || 0);
        // const n = (latOrLng * p) * (1 + Number.EPSILON);
        // return Math.round(n) / p;
    }

    public static CreateLatLng(latLng: {lat: number; lng: number}) {
        const created = new LatLng(latLng);
        created.setPrecision();
        return created;
    }

    public static LimitWithPrecision(latOrLng: number, precision = 12): number {
        return parseFloat(parseFloat('' + latOrLng).toPrecision(precision));
    }

    public static IsEqualsLatLng(
        latOrLng1: number,
        latOrLng2: number,
        cartesianStep = CartesianTools.DEFAULT_SCALE
    ): boolean {
        return (
            CartesianTools.RoundLatLng(latOrLng1, cartesianStep, true) ===
            CartesianTools.RoundLatLng(latOrLng2, cartesianStep, true)
        );
    }

    public static IsAroundLatLng(
        latLngCenter: LatLng,
        latLngAround: LatLng,
        stepRange: number,
        cartesianStep = CartesianTools.DEFAULT_SCALE
    ): boolean {
        let isAround = false;
        const min = -stepRange * cartesianStep,
            max = stepRange * cartesianStep;
        for (let lat = min; !isAround && lat <= max; lat += cartesianStep) {
            for (let lng = min; !isAround && lng <= max; lng += cartesianStep) {
                isAround =
                    CartesianTools.RoundLatLng(latLngCenter.lat, cartesianStep, true) ===
                    CartesianTools.RoundLatLng(latLngAround.lat + lat, cartesianStep, true);
                if (isAround) {
                    isAround =
                        CartesianTools.RoundLatLng(latLngCenter.lng, cartesianStep, true) ===
                        CartesianTools.RoundLatLng(latLngAround.lng + lng, cartesianStep, true);
                }
            }
        }

        return isAround;
    }

    public static IsNotAroundLatLng(
        latLngCenter: LatLng,
        latLngAround: LatLng,
        stepRange: number,
        cartesianStep = CartesianTools.DEFAULT_SCALE
    ): boolean {
        const max = stepRange * cartesianStep + Number.EPSILON;

        let isOut =
            CartesianTools.RoundLatLng(latLngCenter.lat, cartesianStep) >
                CartesianTools.RoundLatLng(latLngAround.lat + max, cartesianStep) ||
            CartesianTools.RoundLatLng(latLngCenter.lat, cartesianStep) <
                CartesianTools.RoundLatLng(latLngAround.lat - max, cartesianStep);
        if (!isOut) {
            isOut =
                CartesianTools.RoundLatLng(latLngCenter.lng, cartesianStep) >
                    CartesianTools.RoundLatLng(latLngAround.lng + max, cartesianStep) ||
                CartesianTools.RoundLatLng(latLngCenter.lng, cartesianStep) <
                    CartesianTools.RoundLatLng(latLngAround.lng - max, cartesianStep);
        }

        return isOut;
    }

    public static DegToRad(azimuthInDegrees: number) {
        return (azimuthInDegrees * Math.PI) / 180;
    }

    public static GetAzimuthRad(angleInDegrees: number): number {
        return CartesianTools.DegToRad(-angleInDegrees + 90);
    }

    public static ComputeLatSteps(cartesianValues: CartesianValue[]): number[] {
        const lats = cartesianValues.map((c) => c.lat).sort((a, b) => a - b);
        return CartesianTools.UniqNum(lats);
    }

    public static ComputeLngSteps(cartesianValues: CartesianValue[]): number[] {
        const lngs = cartesianValues.map((c) => c.lng).sort((a, b) => a - b);
        return CartesianTools.UniqNum(lngs);
    }

    public static LogCartesianValues(cartesianValues: CartesianValue[], logger = console) {
        logger?.log(
            '>> raain-quality ### logCartesianValues with',
            cartesianValues.length,
            CartesianTools.DEFAULT_SCALE,
            ' in progress...'
        );
        const pointsToShow = {};
        const latSteps = CartesianTools.ComputeLatSteps(cartesianValues);
        const lngSteps = CartesianTools.ComputeLngSteps(cartesianValues);

        const labelX = (v: number) => {
            return CartesianTools.LabelWithSign(v);
        };
        const labelY = (v: number) => {
            return CartesianTools.LabelWithSign(v);
        };
        const valueDisplay = (v) => {
            return '' + Math.round(v * 100) / 100;
        };

        for (let lat of latSteps) {
            const xObject = {};
            for (let lng of lngSteps) {
                const latLng = new LatLng({lat, lng});
                latLng.setPrecision(12);
                lat = latLng.lat;
                lng = latLng.lng;
                xObject[labelX(lng)] = valueDisplay(0);
            }
            pointsToShow[labelY(lat)] = xObject;
        }

        for (const [index, point] of cartesianValues.entries()) {
            let value = valueDisplay(point.value);
            if (pointsToShow[labelY(point.lat)][labelX(point.lng)] !== '0') {
                value = '' + value + '?' + pointsToShow[labelY(point.lat)][labelX(point.lng)];
            }

            pointsToShow[labelY(point.lat)][labelX(point.lng)] = value;
        }

        logger?.table(pointsToShow);
    }

    public static UniqNum(a: number[]) {
        return [...new Set(a)];
    }

    public static UniqStr(a: number[]) {
        return [...new Set(a)];
    }

    public static GetDistanceFromLatLngInKm(latLng1: LatLng, latLng2: LatLng) {
        const R = 6371; // Radius of the earth in km
        const dLat = CartesianTools.DegToRad(latLng2.lat - latLng1.lat);
        const dLon = CartesianTools.DegToRad(latLng2.lng - latLng1.lng);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(CartesianTools.DegToRad(latLng1.lat)) *
                Math.cos(CartesianTools.DegToRad(latLng2.lat)) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // Distance in km
    }

    public static VincentyDistance(latLng1: LatLng, latLng2: LatLng) {
        const a = 6378137.0; // WGS84 ellipsoid semi-major axis
        const f = 1 / 298.257223563; // WGS84 ellipsoid flattening
        const b = 6356752.314245; // derived semi-minor axis

        const L = CartesianTools.DegToRad(latLng2.lng - latLng1.lng);
        const U1 = Math.atan((1 - f) * Math.tan(CartesianTools.DegToRad(latLng1.lat)));
        const U2 = Math.atan((1 - f) * Math.tan(CartesianTools.DegToRad(latLng2.lat)));
        const sinU1 = Math.sin(U1);
        const cosU1 = Math.cos(U1);
        const sinU2 = Math.sin(U2);
        const cosU2 = Math.cos(U2);

        let lambda = L;
        let lambdaP: number;
        let iterLimit = 100;
        let cosSqAlpha: number,
            sinSigma: number,
            cos2SigmaM: number,
            cosSigma: number,
            sigma: number,
            sinLambda: number,
            cosLambda: number,
            sinAlpha: number;

        do {
            sinLambda = Math.sin(lambda);
            cosLambda = Math.cos(lambda);
            sinSigma = Math.sqrt(
                cosU2 * sinLambda * (cosU2 * sinLambda) +
                    (cosU1 * sinU2 - sinU1 * cosU2 * cosLambda) *
                        (cosU1 * sinU2 - sinU1 * cosU2 * cosLambda)
            );

            if (sinSigma === 0) {
                return 0;
            } // co-incident points

            cosSigma = sinU1 * sinU2 + cosU1 * cosU2 * cosLambda;
            sigma = Math.atan2(sinSigma, cosSigma);
            sinAlpha = (cosU1 * cosU2 * sinLambda) / sinSigma;
            cosSqAlpha = 1 - sinAlpha * sinAlpha;
            cos2SigmaM = cosSigma - (2 * sinU1 * sinU2) / cosSqAlpha;

            if (isNaN(cos2SigmaM)) {
                cos2SigmaM = 0;
            } // equatorial line

            const C = (f / 16) * cosSqAlpha * (4 + f * (4 - 3 * cosSqAlpha));
            lambdaP = lambda;
            lambda =
                L +
                (1 - C) *
                    f *
                    sinAlpha *
                    (sigma +
                        C *
                            sinSigma *
                            (cos2SigmaM + C * cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM)));
        } while (Math.abs(lambda - lambdaP) > 1e-12 && --iterLimit > 0);

        if (iterLimit === 0) {
            return NaN;
        } // formula failed to converge

        const uSq = (cosSqAlpha * (a * a - b * b)) / (b * b);
        const A = 1 + (uSq / 16384) * (4096 + uSq * (-768 + uSq * (320 - 175 * uSq)));
        const B = (uSq / 1024) * (256 + uSq * (-128 + uSq * (74 - 47 * uSq)));

        const deltaSigma =
            B *
            sinSigma *
            (cos2SigmaM +
                (B / 4) *
                    (cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM) -
                        (B / 6) *
                            cos2SigmaM *
                            (-3 + 4 * sinSigma * sinSigma) *
                            (-3 + 4 * cos2SigmaM * cos2SigmaM)));

        const s = b * A * (sigma - deltaSigma);

        return s / 1000; // distance in kilometers
    }

    public static GetLatLngRectsCenter(latLngRects: [LatLng, LatLng][]) {
        const limitPoints = CartesianTools.GetLimitPoints(latLngRects);

        return new LatLng({
            lat: (limitPoints[1].lat - limitPoints[0].lat) / 2 + limitPoints[0].lat,
            lng: (limitPoints[1].lng - limitPoints[0].lng) / 2 + limitPoints[0].lng,
        });
    }

    public static GetLimitPoints(latLngRects: [LatLng, LatLng][]): [LatLng, LatLng] {
        let latMax: number, lngMax: number, latMin: number, lngMin: number;
        for (const rect of latLngRects) {
            const rectA = rect[0];
            const rectB = rect[1];
            latMax = Math.max(
                rectA.lat,
                rectB.lat,
                typeof latMax !== 'undefined' ? latMax : rectA.lat
            );
            lngMin = Math.min(
                rectA.lng,
                rectB.lng,
                typeof lngMin !== 'undefined' ? lngMin : rectA.lng
            );
            latMin = Math.min(
                rectA.lat,
                rectB.lat,
                typeof latMin !== 'undefined' ? latMin : rectB.lat
            );
            lngMax = Math.max(
                rectA.lng,
                rectB.lng,
                typeof lngMax !== 'undefined' ? lngMax : rectB.lng
            );
        }

        return [new LatLng({lat: latMin, lng: lngMin}), new LatLng({lat: latMax, lng: lngMax})];
    }

    protected static LabelWithSign(val: number) {
        const value = val;
        if (value < 0) {
            return '' + value;
        } else if (value === 0) {
            return ' ' + 0;
        }
        return '+' + value;
    }

    public getScaleLatLng(latLng: LatLng, latDirection = 1): LatLng {
        let lat2 = latLng.lat + this.scale;
        if (latDirection < 0) {
            lat2 = latLng.lat - this.scale;
        }
        const latDist = CartesianTools.VincentyDistance(
            new LatLng({lat: latLng.lat, lng: 0}),
            new LatLng({lat: lat2, lng: 0})
        );
        let lngScale = this.scale;
        let minDiff: number;
        for (let scale = 0; scale <= this.scale * 100; scale += this.scale / 10) {
            scale = CartesianTools.LimitWithPrecision(scale);
            const lngDist = CartesianTools.VincentyDistance(
                new LatLng({lat: lat2, lng: 0}),
                new LatLng({lat: lat2, lng: scale})
            );
            const diff2 = Math.abs(latDist - lngDist);
            if (!minDiff || Math.min(minDiff, diff2) === diff2) {
                minDiff = diff2;
                lngScale = scale;
            } else {
                break;
            }
        }

        const lat = CartesianTools.LimitWithPrecision(this.scale);
        const lng = CartesianTools.LimitWithPrecision(lngScale);
        return new LatLng({lat, lng});
    }

    public getScaleLatLngFromEarth(fromLatLng: LatLng): LatLng {
        const earthMap = EarthMap.initialize(this);

        const posLat = Math.round((90 + fromLatLng.lat) / earthMap.latitudeScale);
        const latitudeLongitudeScale = earthMap.latitudeLongitudeScales[posLat];
        return new LatLng({lat: this.scale, lng: latitudeLongitudeScale});
    }

    public getLatLngFromEarthMap(fromLatLng: LatLng): LatLng {
        const earthMap = EarthMap.initialize(this);

        const posLat = Math.round((90 + fromLatLng.lat) / earthMap.latitudeScale);
        const lat = earthMap.latitudes[posLat];
        const latitudeLongitudeScale = earthMap.latitudeLongitudeScales[posLat];

        const lngPos = Math.round(fromLatLng.lng / latitudeLongitudeScale);
        const lng = CartesianTools.LimitWithPrecision(lngPos * latitudeLongitudeScale);

        return new LatLng({lat, lng});
    }

    public getSquareFromWidthAndCenter(widthInKm: number, center: LatLng): [LatLng, LatLng] {
        const halfWidthKm = widthInKm / 2;

        // Calculate the distance in latitude degrees for half the width
        // We use the fact that 1 degree of latitude is approximately 111.32 km
        const latDiff = halfWidthKm / 111.32;

        // Calculate the southwest and northeast corners
        const southWestLat = center.lat - latDiff;
        const northEastLat = center.lat + latDiff;

        // Calculate the longitude difference based on the latitude-specific scale
        // We use the fact that at the equator, 1 degree of longitude is approximately 111.32 km
        // But this decreases as we move away from the equator, proportional to cos(latitude)
        const lngDiff = halfWidthKm / (111.32 * Math.cos(CartesianTools.DegToRad(center.lat)));

        const southWestLng = center.lng - lngDiff;
        const northEastLng = center.lng + lngDiff;

        // Create raw southwest and northeast corners
        const rawSouthWest = new LatLng({
            lat: southWestLat,
            lng: southWestLng,
        });

        const rawNorthEast = new LatLng({
            lat: northEastLat,
            lng: northEastLng,
        });

        // Use getLatLngFromEarthMap to get the final coordinates aligned with the earth map grid
        const southWest = this.getLatLngFromEarthMap(rawSouthWest);
        const northEast = this.getLatLngFromEarthMap(rawNorthEast);

        return [southWest, northEast];
    }

    public adjustRainNodeWithSquareWidth(rainNode: RainNode, widthInKm: number) {
        const latLngRects: [LatLng, LatLng][] = [
            this.getSquareFromWidthAndCenter(widthInKm, rainNode.getCenter()),
        ];
        rainNode.latLngRectsAsJSON = JSON.stringify(latLngRects);
    }

    // Count how many pixels you have from a square defined by southwest and northeast coordinates
    public howManyPixelsInEarthMap(southWest: LatLng, northEast: LatLng): number {
        // Initialize the earth map
        const earthMap = EarthMap.initialize(this);

        // Ensure southwest is actually southwest and northeast is actually northeast
        const minLat = Math.min(southWest.lat, northEast.lat);
        const maxLat = Math.max(southWest.lat, northEast.lat);
        const minLng = Math.min(southWest.lng, northEast.lng);
        const maxLng = Math.max(southWest.lng, northEast.lng);

        // If the coordinates are the same, return 0
        if (minLat === maxLat && minLng === maxLng) {
            return 0;
        }

        // Find the indices in the latitude array
        const minLatIndex = Math.round((90 + minLat) / earthMap.latitudeScale);
        const maxLatIndex = Math.round((90 + maxLat) / earthMap.latitudeScale);

        let pixelCount = 0;

        // For each latitude in the range
        for (let latIndex = minLatIndex; latIndex < maxLatIndex; latIndex++) {
            // Get the longitude scale for this latitude
            const latitudeLongitudeScale = earthMap.latitudeLongitudeScales[latIndex];

            // Calculate how many longitude steps are in the range
            const minLngIndex = Math.floor(minLng / latitudeLongitudeScale);
            const maxLngIndex = Math.ceil(maxLng / latitudeLongitudeScale);

            // Add the number of pixels for this latitude row
            pixelCount += maxLngIndex - minLngIndex;
        }

        return pixelCount;
    }

    protected buildLatLngEarthMap(): EarthMap {
        // Reset the singleton instance
        EarthMap.reset();

        // Initialize the singleton with this CartesianTools instance
        // The initialize method will build the latitude and longitude scales
        return EarthMap.initialize(this);
    }
}
