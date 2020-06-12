var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var RaainNode_1 = require("./RaainNode");
var Measure = (function (_super) {
    __extends(Measure, _super);
    function Measure(idOrObjectToCopy, date, values, validity) {
        _super.call(this, idOrObjectToCopy);
        if (typeof (idOrObjectToCopy) === 'object') {
            this.date = idOrObjectToCopy.date;
            this.values = idOrObjectToCopy.values;
            this.validity = idOrObjectToCopy.validity;
            return;
        }
        this.date = date;
        this.values = values;
        this.validity = validity;
    }
    Measure.prototype.toJSON = function () {
        var json = {
            "id": this.id,
            "date": this.date,
            "values": this.values,
            "validity": this.validity
        };
        return json;
    };
    return Measure;
})(RaainNode_1.RaainNode);
exports.Measure = Measure;
//# sourceMappingURL=Measure.js.map