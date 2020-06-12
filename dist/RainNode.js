var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var RaainNode_1 = require('./RaainNode');
var Link_1 = require("./Link");
var RadarNode_1 = require("./RadarNode");
var RainComputationNode_1 = require("./RainComputationNode");
/**
 * api/rains/:id
 */
var RainNode = (function (_super) {
    __extends(RainNode, _super);
    function RainNode(idOrObjectToCopy, name, links, status, quality, latitude, longitude, radius) {
        _super.call(this, idOrObjectToCopy, links);
        if (typeof (idOrObjectToCopy) === 'object') {
            this.name = idOrObjectToCopy.name;
            this.status = idOrObjectToCopy.status;
            this.quality = idOrObjectToCopy.quality;
            this.latitude = idOrObjectToCopy.latitude;
            this.longitude = idOrObjectToCopy.longitude;
            this.radius = idOrObjectToCopy.radius;
            this.addRadars(idOrObjectToCopy.links);
            this.addRadars(idOrObjectToCopy.radars);
            this.addCompletedComputations(idOrObjectToCopy.links);
            this.addCompletedComputations(idOrObjectToCopy.lastCompletedComputations);
            return;
        }
        this.name = name;
        this.status = status;
        this.quality = quality;
        this.latitude = latitude;
        this.longitude = longitude;
        this.radius = radius;
        this.addRadars(links);
        this.addCompletedComputations(links);
    }
    RainNode.prototype.toJSON = function () {
        var json = _super.prototype.toJSON.call(this);
        json['name'] = this.name;
        json['status'] = this.status;
        json['quality'] = this.quality;
        json['latitude'] = this.latitude;
        json['longitude'] = this.longitude;
        json['radius'] = this.radius;
        return json;
    };
    RainNode.prototype.getLinkType = function () {
        return 'rain';
    };
    RainNode.prototype.addRadars = function (linksToAdd) {
        this.addLinks(RainNode._getRadarLinks(linksToAdd));
    };
    RainNode.prototype.addCompletedComputations = function (linksToAdd) {
        this.addLinks(RainNode._getRainComputationLinks(linksToAdd));
    };
    RainNode._getRadarLinks = function (linksToPurify) {
        if (!linksToPurify || linksToPurify.length === 0) {
            return [];
        }
        return linksToPurify.map(function (l) {
            if (l instanceof Link_1.Link) {
                return l;
            }
            else if (l.id) {
                return new RadarNode_1.RadarNode(l.id.toString('hex'));
            }
        });
    };
    RainNode._getRainComputationLinks = function (linksToPurify) {
        if (!linksToPurify || linksToPurify.length === 0) {
            return [];
        }
        return linksToPurify.map(function (l) {
            if (l instanceof Link_1.Link) {
                return l;
            }
            else if (l.id) {
                return new RainComputationNode_1.RainComputationNode(l.id.toString('hex'));
            }
        });
    };
    return RainNode;
})(RaainNode_1.RaainNode);
exports.RainNode = RainNode;
//# sourceMappingURL=RainNode.js.map