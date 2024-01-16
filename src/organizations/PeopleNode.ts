/**
 *  api/teams/:id => contacts
 */
export class PeopleNode {

    constructor(
        public id: any | string,
        public role: string,
        public email: string,
        public name: string,
        public comments: string // or additional info
    ) {
        if (typeof id === 'object') {
            this.id = id.id;
            this.role = id.role;
            this.email = id.email;
            this.name = id.name;
            this.comments = id.comments;
        }
    }

    public toJSON(): JSON {
        return {
            id: this.id,
            role: this.role,
            email: this.email,
            name: this.name,
            comments: this.comments,
        } as any;
    }
}