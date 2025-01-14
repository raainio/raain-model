import {LatLng} from '../../cartesian/LatLng';
import {Position} from '../position/Position';
import {CartesianValue} from '../../cartesian/CartesianValue';

export class QualityTools {

    // scale of Pixel regarding LatLng : 1 => 100km, 0.01 => 1km, 0.005 => 500m
    public static DEFAULT_SCALE = 0.01;

    public static IndexOfDualArray(array, itemToFind) {
        for (const [index, value] of array.entries()) {
            if (value[0] === itemToFind[0] && value[1] === itemToFind[1]) {
                return index;
            }
        }
        return -1;
    }

    public static Precision(a) {
        if (!isFinite(a)) {
            return 0;
        }
        let e = 1, p = 0;
        while (Math.round(a * e) / e !== a) {
            e *= 10;
            p++;
        }
        return p;
    }

    public static RoundLatLng(latOrLng: number, scale = QualityTools.DEFAULT_SCALE, needPrecision = false): number {

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

    public static LimitWithPrecision(latOrLng: number, precision = 12): number {
        return parseFloat(parseFloat('' + latOrLng).toPrecision(precision));
    }

    public static IsEqualsLatLng(latOrLng1: number, latOrLng2: number, cartesianStep = QualityTools.DEFAULT_SCALE): boolean {
        return QualityTools.RoundLatLng(latOrLng1, cartesianStep, true) === QualityTools.RoundLatLng(latOrLng2, cartesianStep, true);
    }

    public static IsAroundLatLng(latLngCenter: LatLng, latLngAround: LatLng, stepRange: number,
                                 cartesianStep = QualityTools.DEFAULT_SCALE): boolean {

        let isAround = false;
        const min = -stepRange * cartesianStep,
            max = stepRange * cartesianStep;
        for (let lat = min; !isAround && lat <= max; lat += cartesianStep) {
            for (let lng = min; !isAround && lng <= max; lng += cartesianStep) {
                isAround = QualityTools.RoundLatLng(latLngCenter.lat, cartesianStep, true)
                    === QualityTools.RoundLatLng(latLngAround.lat + lat, cartesianStep, true);
                if (isAround) {
                    isAround = QualityTools.RoundLatLng(latLngCenter.lng, cartesianStep, true)
                        === QualityTools.RoundLatLng(latLngAround.lng + lng, cartesianStep, true);
                }
            }
        }

        return isAround;
    }

    public static IsNotAroundLatLng(latLngCenter: LatLng, latLngAround: LatLng, stepRange: number,
                                    cartesianStep = QualityTools.DEFAULT_SCALE): boolean {

        const max = (stepRange * cartesianStep) + Number.EPSILON;

        let isOut = QualityTools.RoundLatLng(latLngCenter.lat, cartesianStep)
            > QualityTools.RoundLatLng(latLngAround.lat + max, cartesianStep)
            || QualityTools.RoundLatLng(latLngCenter.lat, cartesianStep)
            < QualityTools.RoundLatLng(latLngAround.lat - max, cartesianStep);
        if (!isOut) {
            isOut = QualityTools.RoundLatLng(latLngCenter.lng, cartesianStep)
                > QualityTools.RoundLatLng(latLngAround.lng + max, cartesianStep)
                || QualityTools.RoundLatLng(latLngCenter.lng, cartesianStep)
                < QualityTools.RoundLatLng(latLngAround.lng - max, cartesianStep);
        }

        return isOut;
    }

    public static MapLatLngToPosition(latLng: LatLng, rounded?: boolean, cartesianPixelWidth?: LatLng): Position {
        let x = latLng.lng;
        let y = latLng.lat;
        if (rounded) {
            if (!cartesianPixelWidth) {
                throw new Error('need cartesianPixelWidth to MapLatLngToPosition');
            }
            x = QualityTools.RoundLatLng(x, cartesianPixelWidth.lng, true);
            y = QualityTools.RoundLatLng(y, cartesianPixelWidth.lat, true);
        }

        return new Position({x, y});
    }

    public static MapPositionToLatLng(position: Position): LatLng {
        const lng = position.x;
        const lat = position.y;
        return new LatLng({lat, lng});
    }

    public static DegToRad(azimuthInDegrees: number) {
        return azimuthInDegrees * Math.PI / 180;
    }

    public static GetAzimuthRad(angleInDegrees: number): number {
        return QualityTools.DegToRad(-angleInDegrees + 90);
    }

    public static ComputeLatSteps(cartesianValues: CartesianValue[]): number[] {
        const lats = cartesianValues.map(c => c.lat).sort((a, b) => a - b);
        return QualityTools.UniqNum(lats);
    }

    public static ComputeLngSteps(cartesianValues: CartesianValue[]): number[] {
        const lngs = cartesianValues.map(c => c.lng).sort((a, b) => a - b);
        return QualityTools.UniqNum(lngs);
    }

    public static LogCartesianValues(cartesianValues: CartesianValue[],
                                     logger = console) {
        logger?.log('>> raain-quality ### logCartesianValues with', cartesianValues.length,
            QualityTools.DEFAULT_SCALE, ' in progress...');
        const pointsToShow = {};
        const latSteps = QualityTools.ComputeLatSteps(cartesianValues);
        const lngSteps = QualityTools.ComputeLngSteps(cartesianValues);

        const labelX = (v: number) => {
            return QualityTools.LabelWithSign(v)
        }
        const labelY = (v: number) => {
            return QualityTools.LabelWithSign(v)
        }
        const valueDisplay = (v) => {
            return '' + Math.round(v * 100) / 100;
        }

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
            let value = valueDisplay(point.value)
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

    public static CreateNDimArray(dimensions: any[], defaultValue?: any): any[] {
        if (dimensions.length > 0) {
            const dim = dimensions[0];
            const rest = dimensions.slice(1);
            const newArray = [];
            for (let i = 0; i < dim; i++) {
                newArray[i] = QualityTools.CreateNDimArray(rest, defaultValue);
                if (typeof newArray[i] === 'undefined') {
                    newArray[i] = !defaultValue ? defaultValue : JSON.parse(JSON.stringify(defaultValue));
                }
            }
            return newArray;
        } else {
            return undefined;
        }
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

}
