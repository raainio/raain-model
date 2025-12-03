/**
 * @external
 *  - API: /notifications
 *  - API: /notifications/:notificationId
 */
export class EventNode {
    public id: string;
    public title: string;
    public status: number;
    public red: boolean;
    public description: string;
    public created: Date;
    public modified: Date;

    constructor(json: {
        id: string;
        title: string;
        status: number;
        red: boolean;
        description: string;
        created: Date | string;
        modified: Date | string;
    }) {
        this.id = json.id;
        this.title = json.title;
        this.status = json.status;
        this.red = json.red;
        this.description = json.description;
        this.created = new Date(json.created);
        this.modified = new Date(json.modified);
    }

    public toJSON() {
        return {
            id: this.id,
            title: this.title,
            status: this.status,
            red: this.red,
            description: this.description,
            created: this.created,
            modified: this.modified,
        };
    }
}
