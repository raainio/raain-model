var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var RaainNode_1 = require("./RaainNode");
/**
 *  api/gauges/:id
 */
var GaugeNode = (function (_super) {
    __extends(GaugeNode, _super);
    function GaugeNode(idOrObjectToCopy, name, links, latitude, longitude) {
        _super.call(this, idOrObjectToCopy, links);
        if (typeof idOrObjectToCopy !== "string") {
            this.name = idOrObjectToCopy.name;
            this.latitude = idOrObjectToCopy.latitude;
            this.longitude = idOrObjectToCopy.longitude;
            return;
        }
        this.name = name;
        this.latitude = latitude;
        this.longitude = longitude;
    }
    GaugeNode.prototype.toJSON = function () {
        var json = _super.prototype.toJSON.call(this);
        json['name'] = this.name;
        json['latitude'] = this.latitude;
        json['longitude'] = this.longitude;
        return json;
    };
    GaugeNode.prototype.getLinkType = function () {
        return 'gauge';
    };
    return GaugeNode;
})(RaainNode_1.RaainNode);
exports.GaugeNode = GaugeNode;
//# sourceMappingURL=GaugeNode.js.map