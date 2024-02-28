/**
 *  api/teams/:id => contacts
 */
export class PeopleNode {

    public id: string;
    public role: string;
    public email: string;
    public name: string;
    public comments: string; // potential additional info

    constructor(json: {
                    id: string,
                    role: string,
                    email: string,
                    name: string,
                    comments: string
                }
    ) {
        this.id = json.id;
        this.role = json.role;
        this.email = json.email;
        this.name = json.name;
        this.comments = json.comments;
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
