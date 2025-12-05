import {EventNode} from '../../organization';

// GET /notifications/:notificationId response body
export type RaainApiNotificationsFindOneResponse = ReturnType<EventNode['toJSON']>;
