/**
 * Hateoas Links :
 * [ {
 *    rel: string, // "self" or api types ("rain", "gauge", "radar")
 *    href: string // like "https://.../rains/2"
 *  },...]
 */
export declare class Link {
    rel: string;
    href: string;
    constructor(rel: string, href: string);
    getId(): string;
    static isClonable(object: any): boolean;
    static clone(object: any): Link;
}
