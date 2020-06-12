// api/notifications/:id
var EventNode = (function () {
    function EventNode(id, title, status, red, description, created, modified) {
        this.id = id;
        this.title = title;
        this.status = status;
        this.red = red;
        this.description = description;
        this.created = created;
        this.modified = modified;
    }
    return EventNode;
})();
exports.EventNode = EventNode;
//# sourceMappingURL=EventNode.js.map