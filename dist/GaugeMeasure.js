var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Measure_1 = require('./Measure');
/**
 *  // api/gauges/:id/measures/:id
 */
var GaugeMeasure = (function (_super) {
    __extends(GaugeMeasure, _super);
    function GaugeMeasure() {
        _super.apply(this, arguments);
    }
    GaugeMeasure.prototype.getLinkType = function () {
        return 'gauge-measure';
    };
    return GaugeMeasure;
})(Measure_1.Measure);
exports.GaugeMeasure = GaugeMeasure;
//# sourceMappingURL=GaugeMeasure.js.map