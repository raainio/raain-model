var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Measure_1 = require("./Measure");
var RainMeasure = (function (_super) {
    __extends(RainMeasure, _super);
    function RainMeasure() {
        _super.apply(this, arguments);
    }
    RainMeasure.prototype.getLinkType = function () {
        return 'rain-measure';
    };
    return RainMeasure;
})(Measure_1.Measure);
exports.RainMeasure = RainMeasure;
//# sourceMappingURL=RainMeasure.js.map