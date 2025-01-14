import {RaainNode} from '../organization/RaainNode';
import {Link} from '../organization/Link';
import {RadarNode} from '../radar/RadarNode';
import {RainNode} from './RainNode';
import {RadarMeasure} from '../radar/RadarMeasure';
import {LatLng} from '../cartesian/LatLng';
import {QualityTools} from '../quality/tools/QualityTools';
import {RainMeasure} from './RainMeasure';
import {CartesianMeasureValue} from '../cartesian/CartesianMeasureValue';
import {RainCartesianMeasureValue} from '../cartesian/RainCartesianMeasureValue';
import {CartesianValue} from '../cartesian/CartesianValue';

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

    protected mergeTools: {
        cartesianPixelWidth: LatLng;
        latsLngs: number[][],
        limitPoints: LatLng[]
    };

    constructor(json: {
        id: string,
        date: Date,
        isReady: boolean,

        links?: Link[] | RaainNode[],
        version?: string,
        quality?: number,
        progressIngest?: number,
        progressComputing?: number,
        timeSpentInMs?: number,
        isDoneDate?: Date,
        launchedBy?: string,
        rain?: Link | RaainNode,
        radars?: Link[] | RaainNode[],

    }) {
        super(json);

        this.date = json.date ? new Date(json.date) : null;
        this.quality = json.quality >= 0 ? json.quality : -1;
        this.progressIngest = json.progressIngest >= 0 ? json.progressIngest : -1;
        this.progressComputing = json.progressComputing >= 0 ? json.progressComputing : -1;
        this.timeSpentInMs = json.timeSpentInMs;
        this.isReady = !!json.isReady;
        this.isDoneDate = json.isDoneDate ? new Date(json.isDoneDate) : undefined;
        this.launchedBy = json.launchedBy;

        this.replaceRainLink(json.links);
        this.replaceRainLink(json.rain);
        this.addRadarLinks(json.links);
        this.addRadarLinks(json.radars);
    }

    private static _getRadarLinks(linksToPurify: any[]): any[] {
        if (!linksToPurify || linksToPurify.length === 0) {
            return [];
        }

        return linksToPurify.map(l => {
            if (l instanceof Link) {
                return l;
            } else if (l && l['_id']) {
                return new RadarNode({id: l['_id'].toString(), latitude: 0, longitude: 0, name: l.name, team: l.team});
            } else if (l && l.id) {
                return new RadarNode({
                    id: l.id.toString(),// 'hex'
                    latitude: 0, longitude: 0, name: l.name, team: l.team
                });
            }
        });
    }

    private static _getRadarMeasureLinks(linksToPurify: any[]): any[] {
        if (!linksToPurify || linksToPurify.length === 0) {
            return [];
        }

        return linksToPurify.map(l => {
            if (l instanceof Link) {
                return l;
            } else if (l && l['_id']) {
                return new RadarMeasure({id: l['_id'].toString(), values: []});
            } else if (l && l.id) {
                return new RadarMeasure({id: l.id.toString(), values: []}); // 'hex'
            }
        });
    }

    private static _getRainLink(linkToPurify: RaainNode): RainNode {
        if (!linkToPurify || !linkToPurify.id) {
            return null;
        }

        return new RainNode({
            id: linkToPurify.id.toString(),
            name: linkToPurify.id.toString(),
            team: null
        });
    }

    public toJSON(): any {
        const json = super.toJSON();
        json['date'] = this.date.toISOString();
        json['quality'] = this.quality;
        json['progressIngest'] = this.progressIngest;
        json['progressComputing'] = this.progressComputing;
        json['timeSpentInMs'] = this.timeSpentInMs;
        json['isReady'] = this.isReady;
        json['isDoneDate'] = this.isDoneDate?.toISOString();
        json['launchedBy'] = this.launchedBy;
        json['name'] = this.name;
        return json;
    }

    public addRadarLinks(linksToAdd: Link[] | RaainNode[]): void {
        this.addLinks(RainComputationAbstract._getRadarLinks(linksToAdd));
    }

    public replaceRainLink(linksToAdd: Link | RaainNode | any): void {
        this.addLinks([RainComputationAbstract._getRainLink(linksToAdd)]);
    }

    public addRadarMeasureLinks(linksToAdd: Link[] | any[]): void {
        this.addLinks(RainComputationAbstract._getRadarMeasureLinks(linksToAdd));
    }

    protected getLinkType(): string {
        throw Error('abstract');
    }

    protected buildLatLngMatrix(options: {
        mergeCartesianPixelWidth: LatLng,
        mergeLimitPoints: LatLng[]
    }) {
        const latsLngs: number[][] = [];
        const lngCount = Math.round((options.mergeLimitPoints[1].lng - options.mergeLimitPoints[0].lng)
            / options.mergeCartesianPixelWidth.lng) + 1;
        for (let lat = options.mergeLimitPoints[0].lat;
             lat <= options.mergeLimitPoints[1].lat;
             lat += options.mergeCartesianPixelWidth.lat) {
            lat = QualityTools.RoundLatLng(lat, options.mergeCartesianPixelWidth.lat);
            latsLngs.push(new Array(lngCount).fill(0));
        }

        this.mergeTools = {latsLngs, cartesianPixelWidth: options.mergeCartesianPixelWidth, limitPoints: options.mergeLimitPoints};
        return this.mergeTools;
    }

    protected mergeRainMeasures(rainMeasures: RainMeasure[],
                                options: {
                                    mergeLimitPoints: [LatLng, LatLng],
                                    removeNullValues?: boolean
                                }): RainMeasure[] {
        let rainMeasuresMerged = [];
        let lastCartesianRainMeasure: RainMeasure;
        for (const rainMeasure of rainMeasures) {
            for (const value of rainMeasure.values) {
                if (typeof value['cartesianValues'] !== 'undefined' && typeof value['cartesianPixelWidth'] !== 'undefined') {
                    lastCartesianRainMeasure = rainMeasure;
                    const cartesianMeasureValue = new CartesianMeasureValue(value as any);
                    const cartesianValues = cartesianMeasureValue.getCartesianValues();
                    for (const cartesianValue of cartesianValues) {
                        const latLngIndex = this.getMergeLatLngIndex(cartesianValue);
                        if (latLngIndex[0] >= 0 && latLngIndex[1] >= 0 && latLngIndex[0] < this.mergeTools.latsLngs.length &&
                            latLngIndex[1] < this.mergeTools.latsLngs[latLngIndex[0]].length) {
                            this.mergeTools.latsLngs[latLngIndex[0]][latLngIndex[1]] += cartesianValue.value;
                        } else {
                            // throw new Error(`Wrong mergeRainMeasure ${latLngIndex[0]} ${latLngIndex[1]}`);
                        }
                    }
                }
            }
        }

        if (!lastCartesianRainMeasure) {
            return [];
        }

        let cartesianValuesMerged = this.buildMergeCartesianValues();
        if (options.removeNullValues) {
            cartesianValuesMerged = cartesianValuesMerged.filter(c => !!c.value);
        }

        const rm = new RainMeasure(lastCartesianRainMeasure.toJSON());
        rm.values = [new RainCartesianMeasureValue({
            cartesianValues: cartesianValuesMerged,
            cartesianPixelWidth: this.mergeTools.cartesianPixelWidth,
            version: lastCartesianRainMeasure.getVersion(),
            limitPoints: options.mergeLimitPoints,
        })];
        rainMeasuresMerged = [rm];

        return rainMeasuresMerged;
    }

    protected getMergeLatLngIndex(cartesianValue: CartesianValue) {

        const latMin = Math.round((this.mergeTools.limitPoints[0].lat) / this.mergeTools.cartesianPixelWidth.lat);
        const lngMin = Math.round((this.mergeTools.limitPoints[0].lng) / this.mergeTools.cartesianPixelWidth.lng);
        const latToCompare = Math.round(cartesianValue.lat / this.mergeTools.cartesianPixelWidth.lat);
        const lngToCompare = Math.round(cartesianValue.lng / this.mergeTools.cartesianPixelWidth.lng);

        return [latToCompare - latMin, lngToCompare - lngMin];
    }

    protected getMergeLatLng(latIndex: number, lngIndex: number) {

        const latMin = this.mergeTools.limitPoints[0].lat;
        const lngMin = this.mergeTools.limitPoints[0].lng;
        const latToCompare = latIndex * this.mergeTools.cartesianPixelWidth.lat;
        const lngToCompare = lngIndex * this.mergeTools.cartesianPixelWidth.lng;

        return [latToCompare + latMin, lngToCompare + lngMin];
    }

    protected buildMergeCartesianValues() {
        const cartesianValuesMerged: CartesianValue[] = [];
        for (const [latIndex, latValues] of this.mergeTools.latsLngs.entries()) {
            for (const [lngIndex, value] of latValues.entries()) {
                if (value) {
                    const latLng = this.getMergeLatLng(latIndex, lngIndex);
                    const lat = QualityTools.RoundLatLng(latLng[0], this.mergeTools.cartesianPixelWidth.lat, true);
                    const lng = QualityTools.RoundLatLng(latLng[1], this.mergeTools.cartesianPixelWidth.lng, true);
                    cartesianValuesMerged.push(new CartesianValue({value, lat, lng}));
                }
            }
        }
        return cartesianValuesMerged;
    }

}
