import {expect} from 'chai';
import {EventNode, PeopleNode, TeamNode} from '../../src';

describe('Organization', () => {

    it('should create ones', () => {
        const user1 = new PeopleNode({
            id: 'uid1', role: 'user', email: 'user1@null.com', name: 'user1', comments: 'extra info...'
        });
        const team1 = new TeamNode({
            id: 'tid1',
            name: 'team1',
            description: 'team...',
            contracts: ['basic'],
            contacts: [user1]
        });
        expect(team1.contacts[0].email).eq('user1@null.com');
        expect(team1.contracts[0]).eq('basic');

        const eventNode = new EventNode({
            id: 'event1',
            title: 'EventNode looks OK.',
            status: 0,
            red: false,
            description: 'need help on...',
            created: new Date(),
            modified: new Date()
        });
        expect(eventNode.title).eq('EventNode looks OK.');
    });

});
