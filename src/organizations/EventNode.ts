// api/notifications/:id
export class EventNode {

    constructor(
        public id: string,
        public title: string,
        public status: number,
        public red: boolean,
        public description: string,
        public created: Date,
        public modified: Date
    ) {
    }

    public toJSON(): JSON {
        return {
            id: this.id,
            title: this.title,
            status: this.status,
            red: this.red,
            description: this.description,
            created: this.created,
            modified: this.modified,
        } as any;
    }
}

