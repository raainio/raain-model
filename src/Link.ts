/**
 * Hateoas Links :
 * [ {
 *    rel: string, // "self" or api types ("rain", "gauge", "radar")
 *    href: string // like "https://.../rains/2"
 *  },...]
 */
export class Link {
    constructor(
        public rel: string, // "self" or api types ("rain", "gauge", "radar")
        public href: string // like "https://.../rains/2"
    ) {
    }

    public getId(): string {
        const urls = this.href.split('/');
        // can be enforce : verify rel in -2 urls ?...
        return urls[urls.length - 1];
    }

    public static isClonable(object : any): boolean {
        return object && object.rel && object.href;
    }

    public static clone(object : any) : Link {
        return new Link(object.rel, object.href);
    }
}
