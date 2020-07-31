var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var GaugeNode_1 = require("./GaugeNode");
/**
 * api/gauges/:id?format=map&begin=...
 */
var GaugeNodeMap = (function (_super) {
    __extends(GaugeNodeMap, _super);
    function GaugeNodeMap(idOrObjectToCopy, name, links, latitude, longitude) {
        _super.call(this, idOrObjectToCopy, name, links, latitude, longitude);
        if (typeof idOrObjectToCopy !== "string") {
            if (idOrObjectToCopy.map) {
                this.map = idOrObjectToCopy.map;
            }
            if (!this.map && idOrObjectToCopy.getMapData) {
                this.map = JSON.stringify(idOrObjectToCopy.getMapData());
            }
        }
    }
    GaugeNodeMap.prototype.toJSON = function () {
        var json = _super.prototype.toJSON.call(this);
        if (this.map) {
            json['map'] = this.map;
        }
        return json;
    };
    GaugeNodeMap.prototype.setMapData = function (mapData) {
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
    GaugeNodeMap.prototype.getMapData = function () {
        if (!this.map) {
            return [];
        }
        return JSON.parse(this.map);
    };
    return GaugeNodeMap;
})(GaugeNode_1.GaugeNode);
exports.GaugeNodeMap = GaugeNodeMap;
//# sourceMappingURL=GaugeNodeMap.js.map