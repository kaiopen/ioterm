class FileNode {
    private type: string;
    private name: string;
    private children: FileNode[];

    constructor(type: string, name: string) {
        this.type = type;
        this.name = name;
        this.children = [];
    }

    public getType() {
        return this.type;
    }

    public getName() {
        return this.name;
    }
}
