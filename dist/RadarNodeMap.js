var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var RadarNode_1 = require("./RadarNode");
/**
 * api/radars/:id?format=map&...
  */
var RadarNodeMap = (function (_super) {
    __extends(RadarNodeMap, _super);
    function RadarNodeMap(idOrObjectToCopy, name, links, latitude, longitude) {
        _super.call(this, idOrObjectToCopy, name, links, latitude, longitude);
        if (idOrObjectToCopy.map) {
            this.map = idOrObjectToCopy.map;
        }
        if (!this.map && idOrObjectToCopy.getMapData) {
            this.map = JSON.stringify(idOrObjectToCopy.getMapData());
        }
    }
    RadarNodeMap.prototype.toJSON = function () {
        var json = _super.prototype.toJSON.call(this);
        if (this.map) {
            json['map'] = this.map;
        }
        return json;
    };
    RadarNodeMap.prototype.setMapData = function (mapData) {
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
    RadarNodeMap.prototype.getMapData = function () {
        if (!this.map) {
            return [];
        }
        return JSON.parse(this.map);
    };
    return RadarNodeMap;
})(RadarNode_1.RadarNode);
exports.RadarNodeMap = RadarNodeMap;
//# sourceMappingURL=RadarNodeMap.js.map