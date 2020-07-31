var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var RainComputationNode_1 = require("./RainComputationNode");
// api/rains/:id/computations/:id?format=map&...
var RainComputationMap = (function (_super) {
    __extends(RainComputationMap, _super);
    // public map: RainMeasure[];
    function RainComputationMap(idOrObjectToCopy, periodBegin, periodEnd, links, quality, progressIngest, progressComputing, timeSpentInMs) {
        _super.call(this, idOrObjectToCopy, periodBegin, periodEnd, links, quality, progressIngest, progressComputing, timeSpentInMs);
        if (idOrObjectToCopy.map) {
            this.setMapData(idOrObjectToCopy.map);
        }
        if (idOrObjectToCopy.getMapData) {
            this.setMapData(idOrObjectToCopy.getMapData());
        }
    }
    RainComputationMap.prototype.toJSON = function () {
        var json = _super.prototype.toJSON.call(this);
        if (this.map) {
            json['map'] = this.map;
            delete json['results'];
        }
        return json;
    };
    RainComputationMap.prototype.setMapData = function (mapData) {
        var map = mapData;
        try {
            if (typeof (mapData) !== 'string') {
                map = JSON.stringify(mapData);
            }
        }
        catch (e) {
        }
        this.map = map.toString();
    };
    RainComputationMap.prototype.getMapData = function () {
        if (!this.map) {
            return [];
        }
        return JSON.parse(this.map);
    };
    return RainComputationMap;
})(RainComputationNode_1.RainComputationNode);
exports.RainComputationMap = RainComputationMap;
//# sourceMappingURL=RainComputationMap.js.map