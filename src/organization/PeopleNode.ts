/**
 *  api/teams/:id => contacts
 */
export class PeopleNode {

    public id: string;
    public role: string;
    public email: string;
    public name: string;

    constructor(json: {
                    id: string,
                    role: string,
                    email: string,
                    name: string,
                }
    ) {
        this.id = json.id;
        this.role = json.role;
        this.email = json.email;
        this.name = json.name;
    }

    public toJSON(): any {
        return {
            id: this.id,
            role: this.role,
            email: this.email,
            name: this.name,
        };
    }
}
