import {LatLng} from '../../cartesian';
import {Position} from '../position/Position';

export class QualityTools {

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

    public static MapLatLngToPosition(latLng: LatLng): Position {
        const x = latLng.lng;
        const y = latLng.lat;
        return new Position({x, y});
    }

    public static MapPositionToLatLng(position: Position): LatLng {
        const lng = position.x;
        const lat = position.y;
        return new LatLng({lat, lng});
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

}
