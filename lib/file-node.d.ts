declare class FileNode {
    private type;
    private name;
    private children;
    constructor(type: string, name: string);
    getType(): string;
    getName(): string;
}
