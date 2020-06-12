var RadarMeasureValue = (function () {
    function RadarMeasureValue(angleOrObject, polars) {
        if (!angleOrObject) {
            throw 'Need a valid Object or ID';
        }
        if (typeof (angleOrObject.angle) !== 'undefined') {
            this.angle = angleOrObject.angle;
            this.setPolarsAsContainer(angleOrObject.polars);
            return;
        }
        this.angle = angleOrObject;
        this.setPolarsAsContainer(polars);
    }
    RadarMeasureValue.prototype.getPolarsStringified = function () {
        return JSON.stringify(this.getPolars());
    };
    RadarMeasureValue.prototype.getPolars = function () {
        var converted = this.polars;
        try {
            converted = JSON.parse(converted);
        }
        catch (e) {
        }
        return converted;
    };
    RadarMeasureValue.prototype.setPolarsAsString = function (s) {
        this.polars = JSON.parse(s);
    };
    RadarMeasureValue.prototype.setPolarsAsContainer = function (s) {
        var parsed = s;
        try {
            parsed = JSON.parse(parsed);
        }
        catch (e) {
        }
        this.polars = parsed;
    };
    RadarMeasureValue.prototype.toJSON = function () {
        return {
            "angle": this.angle,
            "polars": this.polars
        };
    };
    RadarMeasureValue.prototype.toJSONWithPolarStringified = function () {
        return {
            "angle": this.angle,
            "polars": this.getPolarsStringified()
        };
    };
    return RadarMeasureValue;
})();
exports.RadarMeasureValue = RadarMeasureValue;
//# sourceMappingURL=RadarMeasureValue.js.map