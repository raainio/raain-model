import {Link} from './Link';
import {IVersion} from './IVersion';

export class RaainNode implements IVersion {

    public id: string;
    public version: string;

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
                let href = '../' + l.getLinkType() + 's';
                const l2 = l as any;
                if (l2.date && l2.date.toISOString) {
                    href += '/' + l2.date.toISOString();
                    if (l2.version) {
                        href += '/' + l2.version;
                    }
                }
                href += '/' + l.id
                return new Link(l.getLinkType(), href);
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

    public toJSON(): any {
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

    public getLinks(linkType?: string): Link[] {
        if (!this.links) {
            return [];
        }
        if (!linkType) {
            return this.links;
        }
        // return this.links.filter(l => l && l.rel && linkType === l.rel);
        return this.links.filter(l => l.getLinkType() === linkType);

    }

    public getLink(linkType: string, index?: number): Link {
        index = !index ? 0 : index;
        const linksFound = this.getLinks(linkType);
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

    public getLinkIds(linkType?: string, index?: number): string[] {
        const linksFound = this.getLinks(linkType);
        return linksFound.map(l => l.getId());
    }

    public getLinksCount(linkType?: string): number {
        const linksFound = this.getLinks(linkType);
        return linksFound.length;
    }

    public getVersion() {
        return this.version;
    }

    protected getLinkType(): string {
        throw new Error('to implement');
    }

}
