// PUT /teams/:teamId request body
export interface RaainApiTeamsUpdateRequestBody {
    description?: string;
    notificationEmails?: string[];
}
