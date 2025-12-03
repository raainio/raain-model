import {Link, RaainNode} from '../organization';
import {RadarMeasure, RadarNode} from '../radar';
import {RainNode} from './RainNode';
import {
    CartesianMeasureValue,
    CartesianTools,
    CartesianValue,
    LatLng,
    RainCartesianMeasureValue,
} from '../cartesian';
import {RainMeasure} from './RainMeasure';
import {MergeLatLng, MergeStrategy} from './MergeStrategy';
import {RaainNodeType} from '../organization/RaainNodeType';

/**
 *  not used directly
 */
export class RainComputationAbstract extends RaainNode {
    public quality: number;
    public progressIngest: number;
    public progressComputing: number;
    public timeSpentInMs: number;
    public date: Date;
    public isReady: boolean;
    public isDoneDate: Date;
    public launchedBy: string;
    public name: string;
    public originalDBZMin: number;
    public originalDBZMax: number;

    protected mergeTools: {
        cartesianTools: CartesianTools;
        latsLngs: MergeLatLng[][];
        limitPoints: LatLng[];
    };

    constructor(json: {
        id: string;
        date: Date | string;
        isReady: boolean;

        name?: string;
        links?: Link[] | RaainNode[];
        version?: string;
        quality?: number;
        progressIngest?: number;
        progressComputing?: number;
        timeSpentInMs?: number;
        isDoneDate?: Date | string;
        launchedBy?: string;
        rain?: string | Link | RaainNode;
        radars?: string[] | Link[] | RaainNode[];
        originalDBZMin?: number;
        originalDBZMax?: number;
    }) {
        super(json);

        this.name = json.name ?? '';
        this.date = json.date ? new Date(json.date) : undefined;
        this.quality = json.quality >= 0 ? json.quality : -1;
        this.progressIngest = json.progressIngest >= 0 ? json.progressIngest : -1;
        this.progressComputing = json.progressComputing >= 0 ? json.progressComputing : -1;
        this.timeSpentInMs = json.timeSpentInMs;
        this.isReady = !!json.isReady;
        this.isDoneDate = json.isDoneDate ? new Date(json.isDoneDate) : undefined;
        this.launchedBy = json.launchedBy;
        this.originalDBZMin = json.originalDBZMin;
        this.originalDBZMax = json.originalDBZMax;

        this.replaceRainLink(json.links);
        this.replaceRainLink(json.rain);
        this.addRadarLinks(json.links);
        this.addRadarLinks(json.radars);
    }

    private static _getRadarLinks(linksToPurify: any[]): any[] {
        if (!linksToPurify || linksToPurify.length === 0) {
            return [];
        }

        return linksToPurify.map((l) => {
            if (l instanceof Link) {
                return l;
            } else if (l && l['_id']) {
                return new RadarNode({
                    id: l['_id'].toString(),
                    latitude: 0,
                    longitude: 0,
                    name: l.name,
                    team: l.team,
                });
            } else if (l && l.id) {
                return new RadarNode({
                    id: l.id.toString(), // 'hex'
                    latitude: 0,
                    longitude: 0,
                    name: l.name,
                    team: l.team,
                });
            }
        });
    }

    private static _getRadarMeasureLinks(linksToPurify: any[]): any[] {
        if (!linksToPurify || linksToPurify.length === 0) {
            return [];
        }

        return linksToPurify.map((l) => {
            if (l instanceof Link) {
                return l;
            } else if (l && l['_id']) {
                return new RadarMeasure({id: l['_id'].toString(), values: []});
            } else if (l && l.id) {
                return new RadarMeasure({id: l.id.toString(), values: []}); // 'hex'
            } else if (typeof l === 'string') {
                return new RadarMeasure({id: l, values: []});
            }
        });
    }

    private static _getRainLink(linkToPurify: RaainNode): RainNode {
        if (!linkToPurify?.id) {
            return null;
        }

        return new RainNode({
            id: linkToPurify.id.toString(),
            name: linkToPurify.id.toString(),
            team: null,
        });
    }

    public toJSON(): {
        id: string;
        links: Link[];
        version?: string;
        isReady: boolean;
        name: string;
        date: string;
        quality: number;
        progressIngest: number;
        progressComputing: number;
        timeSpentInMs: number;
        isDoneDate: string;
        launchedBy: string;
        rain: string;
        radars: string[];
        originalDBZMin: number;
        originalDBZMax: number;
    } {
        const json = super.toJSON();
        const rainLinks = this.links
            .filter((l) => l.getLinkType() === RainNode.TYPE)
            .map((l) => l.getId());
        const rainLink = rainLinks.length === 1 ? rainLinks[0] : '';
        const radarLinks = this.links
            .filter((l) => l.getLinkType() === RadarNode.TYPE)
            .map((l) => l.getId());

        return {
            ...json,
            date: this.date?.toISOString(),
            quality: this.quality,
            progressIngest: this.progressIngest,
            progressComputing: this.progressComputing,
            timeSpentInMs: this.timeSpentInMs,
            isReady: this.isReady,
            isDoneDate: this.isDoneDate?.toISOString(),
            launchedBy: this.launchedBy,
            name: this.name,
            rain: rainLink,
            radars: radarLinks,
            originalDBZMin: this.originalDBZMin,
            originalDBZMax: this.originalDBZMax,
        };
    }

    public addRadarLinks(linksToAdd: string[] | Link[] | RaainNode[]): void {
        this.addLinks(RainComputationAbstract._getRadarLinks(linksToAdd));
    }

    public replaceRainLink(linksToAdd: string | Link | RaainNode | any): void {
        this.addLinks([RainComputationAbstract._getRainLink(linksToAdd)]);
    }

    public addRadarMeasureLinks(linksToAdd: string[] | Link[] | any[]): void {
        this.addLinks(RainComputationAbstract._getRadarMeasureLinks(linksToAdd));
    }

    public getBuiltMergeTools(
        rainMeasures: RainMeasure[],
        options: {
            cartesianTools: CartesianTools;
            mergeLimitPoints: LatLng[];
        }
    ) {
        this.buildLatLngMatrix(options);
        this.buildMergeTools(rainMeasures);
        return this.mergeTools;
    }

    public getMergeLatLngIndex(cartesianValue: CartesianValue) {
        const latLng = this.mergeTools.cartesianTools.getLatLngFromEarthMap(cartesianValue);
        const latLngScale = this.mergeTools.cartesianTools.getScaleLatLngFromEarth(latLng);

        const latIndex = Math.round(
            (latLng.lat - this.mergeTools.limitPoints[0].lat) / latLngScale.lat
        );
        const lngIndex = Math.round(
            (latLng.lng - this.mergeTools.limitPoints[0].lng) / latLngScale.lng
        );

        return {index: [latIndex, lngIndex], latLng};
    }

    protected buildLatLngMatrix(options: {
        cartesianTools: CartesianTools;
        mergeLimitPoints: LatLng[];
    }) {
        const latsLngs: MergeLatLng[][] = [];
        this.mergeTools = {latsLngs, cartesianTools: options.cartesianTools, limitPoints: []};
        if (!options.mergeLimitPoints) {
            return this.mergeTools;
        }

        const downPoint = options.cartesianTools.getLatLngFromEarthMap(options.mergeLimitPoints[0]);
        const topPoint = options.cartesianTools.getLatLngFromEarthMap(options.mergeLimitPoints[1]);
        const scaleLat = options.cartesianTools.getScaleLatLng(downPoint);

        for (let lat = downPoint.lat; lat <= topPoint.lat; lat += scaleLat.lat) {
            lat = CartesianTools.LimitWithPrecision(lat);
            const latLng = new LatLng({lat, lng: downPoint.lng});
            const scaleLng = options.cartesianTools.getScaleLatLng(latLng);
            const lngCount = Math.round((topPoint.lng - downPoint.lng) / scaleLng.lng) + 1;
            const lngs = [];
            for (let i = 0; i < lngCount; i++) {
                const initValue: MergeLatLng = {sum: 0, max: 0, count: 0, latLng: undefined};
                lngs.push(initValue);
            }
            latsLngs.push(lngs);
        }

        this.mergeTools = {
            latsLngs,
            cartesianTools: options.cartesianTools,
            limitPoints: [downPoint, topPoint],
        };
        return this.mergeTools;
    }

    protected buildMergeTools(rainMeasures: RainMeasure[]) {
        for (const rainMeasure of rainMeasures) {
            for (const value of rainMeasure.values) {
                if (typeof value['cartesianValues'] !== 'undefined') {
                    const cartesianMeasureValue = new CartesianMeasureValue(value as any);
                    const cartesianValues = cartesianMeasureValue.getCartesianValues();
                    for (const cartesianValue of cartesianValues) {
                        const {index, latLng} = this.getMergeLatLngIndex(cartesianValue);
                        if (
                            index[0] >= 0 &&
                            index[1] >= 0 &&
                            index[0] < this.mergeTools.latsLngs.length &&
                            index[1] < this.mergeTools.latsLngs[index[0]].length
                        ) {
                            this.mergeTools.latsLngs[index[0]][index[1]].latLng =
                                CartesianTools.CreateLatLng(latLng);
                            this.mergeTools.latsLngs[index[0]][index[1]].sum +=
                                cartesianValue.value;
                            this.mergeTools.latsLngs[index[0]][index[1]].max = Math.max(
                                cartesianValue.value,
                                this.mergeTools.latsLngs[index[0]][index[1]].max
                            );
                            this.mergeTools.latsLngs[index[0]][index[1]].count++;
                        } else {
                            // throw new Error(`Wrong mergeRainMeasure ${latLngIndex[0]} ${latLngIndex[1]}`);
                        }
                    }
                }
            }
        }
    }

    protected getLinkType(): RaainNodeType {
        throw Error('abstract');
    }

    protected mergeRainMeasures(
        rainMeasures: RainMeasure[],
        options: {
            mergeStrategy: MergeStrategy;
            mergeLimitPoints: [LatLng, LatLng];
            removeNullValues?: boolean;
        }
    ): RainMeasure[] {
        if (rainMeasures.length === 0) {
            return [];
        }

        this.buildMergeTools(rainMeasures);

        const firstCartesianRainMeasure = rainMeasures[0];
        const cartesianValuesMerged = this.buildMergeCartesianValues(
            options.mergeStrategy,
            options.removeNullValues
        );

        const rm = new RainMeasure(firstCartesianRainMeasure.toJSON());
        rm.values = [
            new RainCartesianMeasureValue({
                cartesianValues: cartesianValuesMerged,
                version: firstCartesianRainMeasure.getVersion(),
                limitPoints: options.mergeLimitPoints,
            }),
        ];

        return [rm];
    }

    protected buildMergeCartesianValues(mergeStrategy: MergeStrategy, removeNullValues = false) {
        const cartesianValuesMerged: CartesianValue[] = [];
        for (const [latIndex, latValues] of this.mergeTools.latsLngs.entries()) {
            for (const [lngIndex, mergeValue] of latValues.entries()) {
                let value = mergeValue.sum;
                if (mergeStrategy === MergeStrategy.AVERAGE) {
                    value = mergeValue.count ? value / mergeValue.count : -1;
                } else if (mergeStrategy === MergeStrategy.MAX) {
                    value = mergeValue.max;
                }

                if (mergeValue.count && !(removeNullValues && !value)) {
                    const lat = mergeValue.latLng.lat;
                    const lng = mergeValue.latLng.lng;
                    cartesianValuesMerged.push(new CartesianValue({value, lat, lng}));
                }
            }
        }
        return cartesianValuesMerged;
    }
}
