var PolarValues_1 = require("./tools/PolarValues");
var RainMeasureValue = (function () {
    function RainMeasureValue(polars) {
        if (!polars) {
            throw 'RainMeasureValue needs a valid Object';
        }
        if (polars.polars) {
            if (typeof polars.polars === 'string') {
                this.setPolarsAsString(polars.polars);
            }
            else {
                this.setPolarsAsContainer(polars.polars);
            }
            return;
        }
        if (typeof polars === 'string') {
            this.setPolarsAsString(polars);
        }
        else {
            this.setPolarsAsContainer(polars);
        }
    }
    RainMeasureValue.prototype.getPolarsStringified = function () {
        return this.polars.getPolarsStringified();
    };
    RainMeasureValue.prototype.getPolars = function () {
        return this.polars.getPolars();
    };
    RainMeasureValue.prototype.setPolarsAsString = function (s) {
        this.polars = new PolarValues_1.PolarValues(s);
    };
    RainMeasureValue.prototype.setPolarsAsContainer = function (s) {
        this.polars = new PolarValues_1.PolarValues(s);
    };
    RainMeasureValue.prototype.getPolarValue = function (azimuthIndex, edgeIndex) {
        return this.polars.getPolarValue(azimuthIndex, edgeIndex);
    };
    RainMeasureValue.prototype.setPolarValue = function (azimuthIndex, edgeIndex, value) {
        return this.polars.setPolarValue(azimuthIndex, edgeIndex, value);
    };
    RainMeasureValue.prototype.getAzimuthsCount = function () {
        return this.polars.getPolars().length;
    };
    RainMeasureValue.prototype.getPolarEdgesCount = function () {
        var polars = this.polars.getPolars();
        if (polars.length > 0) {
            return polars[0].polarEdges.length;
        }
        return 0;
    };
    RainMeasureValue.prototype.toJSON = function () {
        return this.polars.toJSON();
    };
    RainMeasureValue.prototype.toJSONWithPolarStringified = function () {
        return this.polars.toJSONWithPolarStringified();
    };
    return RainMeasureValue;
})();
exports.RainMeasureValue = RainMeasureValue;
//# sourceMappingURL=RainMeasureValue.js.map