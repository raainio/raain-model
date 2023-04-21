

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
}

