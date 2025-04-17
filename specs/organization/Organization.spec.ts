import {expect} from 'chai';
import {EventNode, PeopleNode, TeamNode} from '../../src';

describe('Organization', () => {

    it('should create People, Team, Event', () => {
        const user1 = new PeopleNode({
            id: 'uid1', roles: ['user', 'test'], email: 'user1@null.com', name: 'user1'
        });
        expect(user1.hasRole('admin')).eq(false);
        expect(user1.hasRole('user')).eq(true);

        user1.addRole('admin');
        expect(user1.hasRole('admin')).eq(true);
        const user2 = new PeopleNode(user1.toJSON());
        expect(JSON.stringify(user2.toJSON())).eq('{"id":"uid1","roles":["user","test","admin"],"email":"user1@null.com","name":"user1"}');

        const team1 = new TeamNode({
            id: 'tid1',
            name: 'team1',
            description: 'team...',
            contracts: ['basic'],
            contacts: [user1]
        });
        expect(team1.contacts[0].email).eq('user1@null.com');
        expect(team1.contracts[0]).eq('basic');
        const team2 = new TeamNode(team1.toJSON());
        expect(JSON.stringify(team2.toJSON())).eq('{"id":"tid1","links":[],"name":"team1","description":"team...","contracts":["basic"],"contacts":[{"id":"uid1","roles":["user","test","admin"],"email":"user1@null.com","name":"user1"}]}');

        const eventNode = new EventNode({
            id: 'event1',
            title: 'EventNode looks OK.',
            status: 0,
            red: false,
            description: 'need help on...',
            created: new Date(123),
            modified: new Date(132)
        });
        expect(eventNode.title).eq('EventNode looks OK.');
        const eventNode2 = new EventNode(eventNode.toJSON());
        expect(JSON.stringify(eventNode2.toJSON())).eq('{"id":"event1","title":"EventNode looks OK.","status":0,"red":false,"description":"need help on...","created":"1970-01-01T00:00:00.123Z","modified":"1970-01-01T00:00:00.132Z"}');
    });

});
