var Link_1 = require("./Link");
var RaainNode = (function () {
    function RaainNode(idOrObjectToCopy, links) {
        if (!idOrObjectToCopy) {
            throw 'RaainNode needs a valid Object or ID';
        }
        if (typeof (idOrObjectToCopy) === 'object') {
            if ((typeof idOrObjectToCopy.id === 'string' || idOrObjectToCopy.links)) {
                this.id = idOrObjectToCopy.id;
                this.setLinks(idOrObjectToCopy.links);
                return;
            }
        }
        if (typeof idOrObjectToCopy === 'string') {
            this.id = idOrObjectToCopy;
        }
        this.setLinks(links);
    }
    RaainNode.prototype.toJSON = function () {
        return {
            "id": this.id,
            "links": this.links,
        };
    };
    RaainNode.prototype.setLinks = function (linksToSet) {
        var purified = RaainNode._getPurifiedLinks(linksToSet);
        this.links = purified;
    };
    RaainNode.prototype.addLinks = function (linksToAdd) {
        if (!this.links) {
            this.links = [];
        }
        var purified = this.links.concat(RaainNode._getPurifiedLinks(linksToAdd));
        this.links = purified;
    };
    RaainNode._getPurifiedLinks = function (linksToPurify) {
        if (!linksToPurify || linksToPurify.length === 0) {
            return [];
        }
        return linksToPurify.map(function (l) {
            if (l instanceof Link_1.Link || Link_1.Link.isClonable(l)) {
                return Link_1.Link.clone(l);
            }
            else if (l && l.getLinkType && l.id) {
                return new Link_1.Link(l.getLinkType(), l.getLinkType() + 's/' + l.id);
            }
            return;
        });
    };
    RaainNode.prototype.getLink = function (linkType, index) {
        if (!this.links || !linkType) {
            return null;
        }
        index = !index ? 0 : index;
        var linksFound = this.links.filter(function (l) { return l && l.rel && linkType.indexOf(l.rel) > -1; });
        var purified = linksFound.map(function (l) { return new Link_1.Link(l.rel, l.href); });
        if (purified.length <= index) {
            return null;
        }
        return purified[index];
    };
    RaainNode.prototype.getLinkId = function (linkType, index) {
        index = !index ? 0 : index;
        var link = this.getLink(linkType, index);
        if (link) {
            return link.getId();
        }
        return null;
    };
    RaainNode.prototype.getLinkType = function () {
        throw 'to implement';
    };
    return RaainNode;
})();
exports.RaainNode = RaainNode;
//# sourceMappingURL=RaainNode.js.map