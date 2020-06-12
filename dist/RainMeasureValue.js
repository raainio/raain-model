var RainMeasureValue = (function () {
    function RainMeasureValue(polars) {
        if (!polars) {
            throw 'Need a valid Object';
        }
        if (polars.polars) {
            this.setPolarsAsContainer(polars.polars);
            return;
        }
        this.setPolarsAsContainer(polars);
    }
    RainMeasureValue.prototype.getPolarsStringified = function () {
        return JSON.stringify(this.getPolars());
    };
    RainMeasureValue.prototype.getPolars = function () {
        var converted = this.polars;
        try {
            converted = JSON.parse(converted);
        }
        catch (e) {
        }
        return converted;
    };
    RainMeasureValue.prototype.setPolarsAsString = function (s) {
        this.polars = JSON.parse(s);
    };
    RainMeasureValue.prototype.setPolarsAsContainer = function (s) {
        var parsed = s;
        try {
            parsed = JSON.parse(parsed);
        }
        catch (e) {
        }
        this.polars = parsed;
    };
    RainMeasureValue.prototype.toJSON = function () {
        return {
            "polars": this.polars
        };
    };
    RainMeasureValue.prototype.toJSONWithPolarStringified = function () {
        return {
            "polars": this.getPolarsStringified()
        };
    };
    return RainMeasureValue;
})();
exports.RainMeasureValue = RainMeasureValue;
//# sourceMappingURL=RainMeasureValue.js.map