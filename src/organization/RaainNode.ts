import {Link} from './Link';
import {IVersion} from './IVersion';

/**
 * Base class for all RAAIN nodes in the system.
 * Implements versioning and link management functionality.
 *
 * @remarks
 * This is the foundation class for all API entities in the RAAIN system.
 * It provides common functionality for:
 * - Version management
 * - HATEOAS link handling
 * - JSON serialization
 *
 * @example
 * ```typescript
 * const node = new RaainNode({
 *   id: 'node1',
 *   version: '1.0.0',
 *   links: [
 *     new Link('self', '/api/nodes/node1')
 *   ]
 * });
 * ```
 */
export class RaainNode implements IVersion {
    /** Unique identifier for the node */
    public id: string;

    /** Array of HATEOAS links associated with the node */
    protected _links: Link[];

    /** Version string of the node */
    public version: string;

    /**
     * Creates a new RaainNode instance.
     *
     * @param json - Configuration object
     * @param json.id - Unique identifier
     * @param json.links - Array of HATEOAS links
     * @param json.version - Version string
     */
    constructor(json: {
        id: string,
        links?: Link[] | RaainNode[],
        version?: string,
    }) {
        if (!json?.id) {
            throw new Error('RaainNode needs a valid Object or ID');
        }

        this.id = json.id;
        this.links =  json.links ? json.links : [];
        this.version = json.version ? json.version : undefined;
    }

    private static _getPurifiedLinks(linksToPurify: any[]): Link[] {
        if (!linksToPurify || linksToPurify.length === 0) {
            return [];
        }

        const linksPurified = linksToPurify
            .filter(l => l !== null && l !== undefined)
            .map(l => {
                if (l instanceof Link || Link.isCloneable(l)) {
                    return Link.clone(l);
                } else if (l && typeof l.getLinkType === 'function' && l.id) {
                    const linkType = l.getLinkType();
                    let href = '../' + linkType + 's';
                    const l2 = l;
                    if (l2.date?.toISOString) {
                        href += '/' + l2.date.toISOString();
                        if (l2.version) {
                            href += '/' + l2.version;
                        }
                    }
                    href += '/' + l2.id;
                    return new Link(linkType, href);
                }
                return null;
            })
            .filter(l => l !== null);

        function uniqBy(a: Link[], key: (a: any) => string) {
            const seen = {};
            return a.filter((item) => {
                if (!item) {
                    return false;
                }
                const k = key(item);
                if (seen.hasOwnProperty(k)) {
                    return false;
                }
                seen[k] = true;
                return true;
            });
        }

        return uniqBy(linksPurified, JSON.stringify);
    }

    /**
     * Converts the node to a JSON object.
     *
     * @returns A JSON object containing the node's data
     */
    public toJSON(): any {
        const json: any = {
            id: this.id,
            links: this.links
        };

        if (this.version) {
            json.version = this.version;
        }

        return json;
    }

    /**
     * Gets all links associated with the node.
     *
     * @returns Array of HATEOAS links
     */
    public get links(): Link[] {
        return this._links;
    }

    /**
     * Sets the links for the node.
     * 
     * @param links - Array of links to set
     */
    public set links(links: Link[] | RaainNode[]) {
        this._links = RaainNode._getPurifiedLinks(links);
    }

    /**
     * Gets the ID from a link by its relationship type.
     *
     * @param rel - Relationship type of the link
     * @returns The ID from the link, or undefined if not found
     */
    public getLinkId(rel: string): string | undefined {
        const link = this._links.find(l => l.getLinkType() === rel);
        return link ? link.getId() : undefined;
    }

    /**
     * Gets all link IDs associated with the node.
     *
     * @returns Array of link IDs
     */
    public getLinkIds(): string[] {
        return this._links.map(l => l.getId());
    }

    /**
     * Gets the count of links, optionally filtered by type.
     *
     * @param linkType - Optional type of links to count
     * @returns The number of links
     */
    public getLinksCount(linkType?: string): number {
        if (!this._links) {
            return 0;
        }
        if (!linkType) {
            return this._links.length;
        }
        return this._links.filter(l => l.getLinkType() === linkType).length;
    }

    /**
     * Adds new links to the node.
     *
     * @param links - Array of links to add
     */
    public addLinks(links: Link[] | RaainNode[]) {
        if (!links) {
            return;
        }

        this._links = RaainNode._getPurifiedLinks([...this._links, ...links]);
    }

    /**
     * Gets the version string of the node.
     *
     * @returns The version string
     */
    public getVersion(): string | undefined {
        return this.version;
    }
}
