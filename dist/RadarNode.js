var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var RaainNode_1 = require("./RaainNode");
/**
 *  api/radars/:id
 */
var RadarNode = (function (_super) {
    __extends(RadarNode, _super);
    function RadarNode(idOrObjectToCopy, name, links, latitude, longitude) {
        _super.call(this, idOrObjectToCopy, links);
        if (typeof (idOrObjectToCopy) === 'object') {
            this.name = idOrObjectToCopy.name;
            this.latitude = idOrObjectToCopy.latitude;
            this.longitude = idOrObjectToCopy.longitude;
            return;
        }
        this.name = name;
        this.latitude = latitude;
        this.longitude = longitude;
    }
    RadarNode.prototype.toJSON = function () {
        var json = _super.prototype.toJSON.call(this);
        json['name'] = this.name;
        json['latitude'] = this.latitude;
        json['longitude'] = this.longitude;
        return json;
    };
    RadarNode.prototype.getLinkType = function () {
        return 'radar';
    };
    return RadarNode;
})(RaainNode_1.RaainNode);
exports.RadarNode = RadarNode;
//# sourceMappingURL=RadarNode.js.map