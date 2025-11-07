import {RaainNodeType} from './RaainNodeType';

/**
 * Hateoas Links :
 * [ {
 *    rel: string, // "self" or api types ("rain", "gauge", "radar", "radar-measure", "rain-computation"...)
 *    href: string // like "https://../rains/2"
 *  },...]
 */
export class Link {
    constructor(
        public rel: string,
        public href: string
    ) {}

    public static isCloneable(object: any): boolean {
        return object?.rel && object?.href;
    }

    public static clone(object: any): Link | null {
        if (!object?.rel || !object?.href) {
            return null;
        }
        return new Link(object.rel, object.href);
    }

    public getId(): string {
        const urls = this.href.split('/');
        // can be enforced : verify rel in -2 urls ?...
        return urls[urls.length - 1];
    }

    public getLinkType(): string | RaainNodeType {
        // const urls = this.href.split('/');
        // can be enforced : verify rel in -2 urls ?...
        // return urls[1].substring(0, urls[1].length - 1);
        return this.rel;
    }
}
