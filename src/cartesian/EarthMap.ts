import {LatLng} from './LatLng';
import {CartesianTools} from './CartesianTools';

export class EarthMap {
    private static instance: EarthMap;

    latitudeScale: number;
    latitudes: number[];
    latitudeLongitudeScales: number[];

    private constructor() {
        this.latitudes = [];
        this.latitudeLongitudeScales = [];
        this.latitudeScale = CartesianTools.DEFAULT_SCALE;
    }

    public static getInstance(): EarthMap {
        if (!EarthMap.instance) {
            EarthMap.instance = new EarthMap();
        }
        return EarthMap.instance;
    }

    public static initialize(cartesianTools: CartesianTools): EarthMap {
        const instance = EarthMap.getInstance();

        if (instance.latitudes.length) {
            return instance;
        }

        instance.latitudes = [];
        instance.latitudeLongitudeScales = [];
        instance.latitudeScale = cartesianTools.scale;

        // Build the latitude and longitude scales
        for (let lat = -90; lat <= 90; lat += cartesianTools.scale) {
            lat = CartesianTools.LimitWithPrecision(lat);
            instance.latitudes.push(lat);
            let direction = 1;
            if (lat > 0) {
                direction = -1;
            }
            instance.latitudeLongitudeScales.push(
                cartesianTools.getScaleLatLng(new LatLng({lat, lng: 0}), direction).lng
            );
        }

        return instance;
    }

    /**
     * Reset the EarthMap instance
     */
    public static reset(): void {
        EarthMap.instance = null;
    }
}
