var MeasureValuePolarContainer_1 = require("../MeasureValuePolarContainer");
var PolarValue_1 = require("../PolarValue");
var PolarValues = (function () {
    function PolarValues(polars) {
        if (typeof polars === 'string') {
            this.setPolarsAsString(polars);
        }
        else if (polars instanceof PolarValues && polars.getPolars()) {
            this.setPolarsAsContainer(polars.getPolars());
        }
        else {
            this.setPolarsAsContainer(polars);
        }
    }
    PolarValues.prototype.getPolarsStringified = function () {
        return JSON.stringify(this.getPolars());
    };
    PolarValues.prototype.getPolars = function () {
        var converted = this.polars;
        try {
        }
        catch (e) {
            console.warn('getPolars pb: ', e, typeof converted, converted);
        }
        return converted;
    };
    PolarValues.prototype.setPolarsAsString = function (s) {
        try {
            var polars = JSON.parse(s);
            // console.warn('setPolarsAsString polars: ', polars, typeof s, s);
            if (polars && polars.polars) {
                polars = polars.polars;
            }
            // console.warn('setPolarsAsString polars : ', polars, typeof polars);
            if (typeof polars === 'string') {
                polars = JSON.parse(polars);
            }
            // console.warn('setPolarsAsString polars  : ', polars);
            this.polars = polars.map(function (convertedPolar) { return new MeasureValuePolarContainer_1.MeasureValuePolarContainer(convertedPolar); });
        }
        catch (e) {
            console.warn('setPolarsAsString pb: ', e, typeof s, s);
            this.polars = [];
        }
    };
    PolarValues.prototype.setPolarsAsContainer = function (s) {
        var parsed = s ? s : [];
        if (!('length' in parsed)) {
            parsed = [];
        }
        this.polars = parsed;
    };
    PolarValues.prototype.getPolarValue = function (azimuthIndex, edgeIndex) {
        azimuthIndex = this.updateIndex(this.polars, azimuthIndex);
        var azimuthContainer = this.polars[azimuthIndex];
        if (!azimuthContainer) {
            return null;
        }
        edgeIndex = this.updateIndex(azimuthContainer.polarEdges, edgeIndex);
        var edgeValue = azimuthContainer.polarEdges[edgeIndex];
        return new PolarValue_1.PolarValue(edgeValue, azimuthContainer.azimuth, azimuthContainer.distance * edgeIndex);
    };
    PolarValues.prototype.setPolarValue = function (azimuthIndex, edgeIndex, value) {
        azimuthIndex = this.updateIndex(this.polars, azimuthIndex);
        var azimuthContainer = this.polars[azimuthIndex];
        if (!azimuthContainer) {
            return null;
        }
        edgeIndex = this.updateIndex(azimuthContainer.polarEdges, edgeIndex);
        azimuthContainer.polarEdges[edgeIndex] = value;
    };
    PolarValues.prototype.toJSON = function () {
        return {
            "polars": this.polars
        };
    };
    PolarValues.prototype.toJSONWithPolarStringified = function () {
        return {
            "polars": this.getPolarsStringified()
        };
    };
    PolarValues.prototype.updateIndex = function (array, index) {
        if (array.length <= index) {
            index = index - array.length;
        }
        else if (index < 0) {
            index = array.length + index;
        }
        return index;
    };
    return PolarValues;
})();
exports.PolarValues = PolarValues;
//# sourceMappingURL=PolarValues.js.map