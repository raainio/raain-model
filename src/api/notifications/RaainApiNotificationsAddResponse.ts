import {EventNode} from '../../organization';

// POST /notifications response body
export type RaainApiNotificationsAddResponse = ReturnType<EventNode['toJSON']>;
