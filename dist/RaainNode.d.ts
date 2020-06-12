import { Link } from "./Link";
export declare class RaainNode {
    id: string;
    private links;
    constructor(idOrObjectToCopy: any | string, links?: Link[] | any[]);
    toJSON(): Object;
    setLinks(linksToSet: Link[] | any[]): void;
    addLinks(linksToAdd: Link[] | any[]): void;
    private static _getPurifiedLinks(linksToPurify);
    getLink(linkType: string, index?: number): Link;
    getLinkId(linkType: string, index?: number): string;
    protected getLinkType(): string;
}
