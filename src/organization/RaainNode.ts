import {Link} from './Link';
import {IVersion} from './IVersion';

export class RaainNode implements IVersion {

    public readonly id: string;
    public readonly version: string;
    private links: Link[];

    constructor(json: {
        id: string,
        links?: Link[] | RaainNode[],
        version?: string
    }) {

        if (!json?.id) {
            throw new Error('RaainNode needs a valid Object or ID');
        }

        this.id = json.id;
        this.setLinks(json.links ? json.links : []);
        this.version = json.version ? json.version : undefined;
    }

    private static _getPurifiedLinks(linksToPurify: any[]): Link[] {
        if (!linksToPurify || linksToPurify.length === 0) {
            return [];
        }

        const linksPurified = linksToPurify.map(l => {
            if (l instanceof Link || Link.isCloneable(l)) {
                return Link.clone(l);
            } else if (l && l.getLinkType && l.id) {
                return new Link(l.getLinkType(), '../' + l.getLinkType() + 's/' + l.id);
            }
        });

        function uniqBy(a, key) {
            const seen = {};
            return a.filter((item) => {
                if (!item) {
                    return false;
                }

                const k = key(item);
                return seen.hasOwnProperty(k) ? false : (seen[k] = true);
            });
        }

        return uniqBy(linksPurified, JSON.stringify);
    }

    public toJSON(): JSON {
        return {
            id: this.id,
            links: this.links,
            version: this.version,
        } as any;
    }

    public getId(): string {
        return this.id.toString();
    }

    public setLinks(linksToSet: Link[] | RaainNode[]) {
        this.links = RaainNode._getPurifiedLinks(linksToSet);
    }

    public addLinks(linksToAdd: Link[] | RaainNode[]) {
        if (!this.links) {
            this.links = [];
        }
        const concatLinks = this.links.concat((linksToAdd as Link[]));
        this.links = RaainNode._getPurifiedLinks(concatLinks);
    }

    public getLink(linkType: string, index?: number): Link {
        if (!this.links || !linkType) {
            return null;
        }
        index = !index ? 0 : index;
        const linksFound = this.links.filter(l => l && l.rel && linkType === l.rel);
        if (linksFound.length <= index) {
            return null;
        }
        return linksFound[index];
    }

    public getLinkId(linkType: string, index?: number): string {
        index = !index ? 0 : index;
        const link = this.getLink(linkType, index);
        if (link) {
            return link.getId();
        }
        return null;
    }

    public getLinksCount(linkType?: string): number {
        if (!linkType) {
            return this.links.length;
        }

        const linksFound = this.links.filter(l => l?.rel === linkType);
        return linksFound.length;
    }

    public getLinks(): Link[] {
        return this.links.map(l => Link.clone(l));
    }

    public getVersion() {
        return this.version;
    }

    protected getLinkType(): string {
        throw new Error('to implement');
    }

}
