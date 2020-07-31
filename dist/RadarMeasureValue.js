var PolarValues_1 = require("./tools/PolarValues");
var RadarMeasureValue = (function () {
    function RadarMeasureValue(angleOrObject, polars) {
        if (!angleOrObject) {
            throw 'RadarMeasureValue needs a valid Object or ID';
        }
        if (typeof (angleOrObject.angle) !== 'undefined') {
            this.angle = angleOrObject.angle;
            if (typeof angleOrObject.polars === 'string') {
                this.setPolarsAsString(angleOrObject.polars);
            }
            else {
                this.setPolarsAsContainer(angleOrObject.polars);
            }
            return;
        }
        this.angle = angleOrObject;
        if (typeof polars === 'string') {
            this.setPolarsAsString(polars);
        }
        else {
            this.setPolarsAsContainer(polars);
        }
    }
    RadarMeasureValue.prototype.getPolarsStringified = function () {
        return this.polars.getPolarsStringified();
    };
    RadarMeasureValue.prototype.getPolars = function () {
        return this.polars.getPolars();
    };
    RadarMeasureValue.prototype.setPolarsAsString = function (s) {
        this.polars = new PolarValues_1.PolarValues(s);
    };
    RadarMeasureValue.prototype.setPolarsAsContainer = function (s) {
        this.polars = new PolarValues_1.PolarValues(s);
    };
    RadarMeasureValue.prototype.getPolarValue = function (azimuthIndex, edgeIndex) {
        return this.polars.getPolarValue(azimuthIndex, edgeIndex);
    };
    RadarMeasureValue.prototype.setPolarValue = function (azimuthIndex, edgeIndex, value) {
        return this.polars.setPolarValue(azimuthIndex, edgeIndex, value);
    };
    RadarMeasureValue.prototype.toJSON = function () {
        var json = this.polars.toJSON();
        json.angle = this.angle;
        return json;
    };
    RadarMeasureValue.prototype.toJSONWithPolarStringified = function () {
        var json = this.polars.toJSONWithPolarStringified();
        json.angle = this.angle;
        return json;
    };
    return RadarMeasureValue;
})();
exports.RadarMeasureValue = RadarMeasureValue;
//# sourceMappingURL=RadarMeasureValue.js.map