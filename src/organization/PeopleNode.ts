export class PeopleNode {
    public id: string;
    public roles: string[];
    public email: string;
    public name: string;

    constructor(json: {id: string; roles: string[]; email: string; name: string}) {
        this.id = json.id;
        this.roles = json.roles;
        this.email = json.email;
        this.name = json.name;
    }

    public toJSON() {
        return {
            id: this.id,
            roles: this.roles,
            email: this.email,
            name: this.name,
        };
    }

    hasRole(role: string): boolean {
        return this.roles.indexOf(role) >= 0;
    }

    addRole(role: string) {
        if (!this.hasRole(role)) {
            this.roles.push(role);
        }
    }
}
