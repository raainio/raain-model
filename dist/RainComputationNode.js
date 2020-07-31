var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var RaainNode_1 = require("./RaainNode");
var Link_1 = require("./Link");
var RadarNode_1 = require("./RadarNode");
var RainNode_1 = require("./RainNode");
var RadarMeasure_1 = require("./RadarMeasure");
var RainComputationNode = (function (_super) {
    __extends(RainComputationNode, _super);
    function RainComputationNode(idOrObjectToCopy, periodBegin, periodEnd, links, quality, progressIngest, progressComputing, timeSpentInMs, isReady, isDoneDate, results, launchedBy) {
        _super.call(this, idOrObjectToCopy, links);
        if (typeof idOrObjectToCopy !== 'string') {
            this.periodBegin = idOrObjectToCopy.periodBegin;
            this.periodEnd = idOrObjectToCopy.periodEnd;
            this.quality = idOrObjectToCopy.quality;
            this.progressIngest = idOrObjectToCopy.progressIngest;
            this.progressComputing = idOrObjectToCopy.progressComputing;
            this.timeSpentInMs = idOrObjectToCopy.timeSpentInMs;
            this.isReady = idOrObjectToCopy.isReady;
            this.isDoneDate = idOrObjectToCopy.isDoneDate;
            this.results = idOrObjectToCopy.results;
            this.launchedBy = idOrObjectToCopy.launchedBy;
            this.replaceRainLink(idOrObjectToCopy.links);
            this.replaceRainLink(idOrObjectToCopy.rain);
            this.addRadarLinks(idOrObjectToCopy.links);
            this.addRadarLinks(idOrObjectToCopy.radars);
            return;
        }
        this.periodBegin = periodBegin;
        this.periodEnd = periodEnd;
        this.quality = quality;
        this.progressIngest = progressIngest;
        this.progressComputing = progressComputing;
        this.timeSpentInMs = timeSpentInMs;
        this.isReady = isReady;
        this.isDoneDate = isDoneDate;
        this.results = results;
        this.launchedBy = launchedBy;
        this.replaceRainLink(links);
        this.addRadarLinks(links);
    }
    RainComputationNode.prototype.toJSON = function () {
        var json = _super.prototype.toJSON.call(this);
        json['periodBegin'] = this.periodBegin;
        json['periodEnd'] = this.periodEnd;
        json['quality'] = this.quality;
        json['progressIngest'] = this.progressIngest;
        json['progressComputing'] = this.progressComputing;
        json['timeSpentInMs'] = this.timeSpentInMs;
        json['isReady'] = this.isReady;
        json['isDoneDate'] = this.isDoneDate;
        json['results'] = this.results;
        json['launchedBy'] = this.launchedBy;
        return json;
    };
    RainComputationNode.prototype.getLinkType = function () {
        return 'rain-computation';
    };
    RainComputationNode.prototype.addRadarLinks = function (linksToAdd) {
        this.addLinks(RainComputationNode._getRadarLinks(linksToAdd));
    };
    RainComputationNode.prototype.replaceRainLink = function (linksToAdd) {
        this.addLinks([RainComputationNode._getRainLink(linksToAdd)]);
    };
    RainComputationNode.prototype.addRadarMeasureLinks = function (linksToAdd) {
        this.addLinks(RainComputationNode._getRadarMeasureLinks(linksToAdd));
    };
    RainComputationNode._getRadarLinks = function (linksToPurify) {
        if (!linksToPurify || linksToPurify.length === 0) {
            return [];
        }
        return linksToPurify.map(function (l) {
            if (l instanceof Link_1.Link) {
                return l;
            }
            else if (l && l.id) {
                return new RadarNode_1.RadarNode(l.id.toString('hex'));
            }
        });
    };
    RainComputationNode._getRadarMeasureLinks = function (linksToPurify) {
        if (!linksToPurify || linksToPurify.length === 0) {
            return [];
        }
        return linksToPurify.map(function (l) {
            if (l instanceof Link_1.Link) {
                return l;
            }
            else if (l && l.id) {
                return new RadarMeasure_1.RadarMeasure(l.id.toString('hex'));
            }
        });
    };
    RainComputationNode._getRainLink = function (linkToPurify) {
        if (!linkToPurify || !linkToPurify.id) {
            return null;
        }
        return new RainNode_1.RainNode(linkToPurify.id.toString('hex'));
    };
    return RainComputationNode;
})(RaainNode_1.RaainNode);
exports.RainComputationNode = RainComputationNode;
//# sourceMappingURL=RainComputationNode.js.map