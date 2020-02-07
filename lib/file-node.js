var FileNode = /** @class */ (function () {
    function FileNode(type, name) {
        this.type = type;
        this.name = name;
        this.children = [];
    }
    FileNode.prototype.getType = function () {
        return this.type;
    };
    FileNode.prototype.getName = function () {
        return this.name;
    };
    return FileNode;
}());
