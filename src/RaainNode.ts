import {Link} from "./Link";

export class RaainNode {

    public id: string;

    private links: Link[];

    constructor(
        idOrObjectToCopy: any | string,
        links?: Link[] | any[]
    ) {

        if (!idOrObjectToCopy) {
            throw 'Need a valid Object or ID';
        }

        if (typeof(idOrObjectToCopy) === 'object' && (idOrObjectToCopy.id || idOrObjectToCopy.links)) {
            this.id = idOrObjectToCopy.id;
            this.setLinks(idOrObjectToCopy.links);
            return;
        }
        this.id = idOrObjectToCopy;
        this.setLinks(links);
    }

    public toJSON(): Object {
        return {
            "id": this.id,
            "links": this.links,
        };
    }

    public setLinks(linksToSet: Link[] | any[]) {
        let purified: Link[] = RaainNode._getPurifiedLinks(linksToSet);
        this.links = purified;
    }

    public addLinks(linksToAdd: Link[] | any[]) {
        if (!this.links) {
            this.links = [];
        }
        let purified: Link[] = this.links.concat(RaainNode._getPurifiedLinks(linksToAdd));
        this.links = purified;
    }

    private static _getPurifiedLinks(linksToPurify: any[]): Link[] {
        if (!linksToPurify || linksToPurify.length === 0) {
            return [];
        }

        return linksToPurify.map(l => {
            if (l instanceof Link || Link.isClonable(l)) {
                return Link.clone(l);
            } else if (l && l.getLinkType && l.id) {
                return new Link(l.getLinkType(), l.getLinkType() + 's/' + l.id);
            }
            return;
        })
    }

    public getLink(linkType: string, index?: number): Link {
        if (!this.links || !linkType) {
            return null;
        }
        index = !index ? 0 : index;
        const linksFound = this.links.filter(l => l && l.rel && linkType.indexOf(l.rel) > -1);
        const purified: Link[] = linksFound.map(l => new Link(l.rel, l.href));
        if (purified.length <= index) {
            return null;
        }
        return purified[index];
    }

    public getLinkId(linkType: string, index?: number): string {
        index = !index ? 0 : index;
        const link = this.getLink(linkType, index);
        if (link) {
            return link.getId();
        }
        return null;
    }

    protected getLinkType(): string {
        throw 'to implement';
    }

}


