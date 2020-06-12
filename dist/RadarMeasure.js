var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Measure_1 = require('./Measure');
/**
 *  // api/radars/:id/measures/:id
 */
var RadarMeasure = (function (_super) {
    __extends(RadarMeasure, _super);
    function RadarMeasure() {
        _super.apply(this, arguments);
    }
    RadarMeasure.prototype.getLinkType = function () {
        return 'radar-measure';
    };
    return RadarMeasure;
})(Measure_1.Measure);
exports.RadarMeasure = RadarMeasure;
//# sourceMappingURL=RadarMeasure.js.map