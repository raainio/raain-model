/**
 * Hateoas Links :
 * [ {
 *    rel: string, // "self" or api types ("rain", "gauge", "radar")
 *    href: string // like "https://.../rains/2"
 *  },...]
 */
var Link = (function () {
    function Link(rel, // "self" or api types ("rain", "gauge", "radar")
        href // like "https://.../rains/2"
        ) {
        this.rel = rel;
        this.href = href;
    }
    Link.prototype.getId = function () {
        var urls = this.href.split('/');
        // can be enforce : verify rel in -2 urls ?...
        return urls[urls.length - 1];
    };
    Link.isClonable = function (object) {
        return object && object.rel && object.href;
    };
    Link.clone = function (object) {
        return new Link(object.rel, object.href);
    };
    return Link;
})();
exports.Link = Link;
//# sourceMappingURL=Link.js.map