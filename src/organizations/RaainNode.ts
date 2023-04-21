import {Link} from './Link';
import {IVersion} from './IVersion';

export class RaainNode implements IVersion {

    constructor(
        idOrObjectToCopy: any | string,
        links?: Link[] | RaainNode[],
        version?: string
    ) {

        if (!idOrObjectToCopy) {
            throw new Error('RaainNode needs a valid Object or ID');
        }

        if (typeof (idOrObjectToCopy) === 'object') {
            if ((typeof idOrObjectToCopy.id === 'string' || idOrObjectToCopy.links || idOrObjectToCopy.version)) {
                this.id = idOrObjectToCopy.id;
                this.setLinks(idOrObjectToCopy.links);
                this.version = idOrObjectToCopy.version ? idOrObjectToCopy.version : undefined;
                return;
            }
        }
        if (typeof idOrObjectToCopy === 'string') {
            this.id = idOrObjectToCopy;
        }
        this.version = version ? version : undefined;

        this.setLinks(links);
    }

    public readonly id: string;
    private links: Link[];
    private readonly version: string;

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
            return a.filter(function(item) {
                if (!item) {
                    return false;
                }

                const k = key(item);
                return seen.hasOwnProperty(k) ? false : (seen[k] = true);
            });
        }

        const finalLinks = uniqBy(linksPurified, JSON.stringify);

        return finalLinks;
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
        const linksFound = this.links.filter(l => l && l.rel && linkType.indexOf(l.rel) > -1);
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

        const linksFound = this.links.filter(l => l && l.rel && linkType.indexOf(l.rel) > -1);
        return linksFound.length;
    }

    protected getLinkType(): string {
        throw new Error('to implement');
    }

    public getVersion() {
        return this.version;
    }

}