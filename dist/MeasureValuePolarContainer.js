var MeasureValuePolarContainer = (function () {
    function MeasureValuePolarContainer(azimuthOrObjectToCopy, distance, polarEdges) {
        if (!azimuthOrObjectToCopy && azimuthOrObjectToCopy !== 0) {
            throw 'MeasureValuePolarContainer needs a valid Object or ID';
        }
        if (typeof (azimuthOrObjectToCopy.azimuth) !== 'undefined') {
            this.azimuth = azimuthOrObjectToCopy.azimuth;
            this.distance = azimuthOrObjectToCopy.distance;
            this.polarEdges = azimuthOrObjectToCopy.polarEdges;
            return;
        }
        this.azimuth = azimuthOrObjectToCopy;
        this.distance = distance;
        this.polarEdges = polarEdges;
    }
    MeasureValuePolarContainer.prototype.toJSON = function () {
        return {
            "azimuth": this.azimuth,
            "distance": this.distance,
            "polarEdges": this.polarEdges,
        };
    };
    return MeasureValuePolarContainer;
})();
exports.MeasureValuePolarContainer = MeasureValuePolarContainer;
//# sourceMappingURL=MeasureValuePolarContainer.js.map