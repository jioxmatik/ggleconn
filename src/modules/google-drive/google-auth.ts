var google = require("googleapis");

var OAuth2 = google.auth.OAuth2;


export interface AuthOptions {
    clientId: string;
    clientSecret: string;
    back: string;
}

export class GoogleAuth {
    scopes: string[];
    oauth2Client: any;

    /**
     *  Init Google api client and drive scopes
     * @param {object} options Auth options for the Google Api
     * @param {string} options.clientId Google api client id
     * @param {string} options.clientSecret Google api client secret
     * @param {string} options.back from google api back url
     */
    constructor(options: AuthOptions) {
        this.oauth2Client = new OAuth2(options.clientId, options.clientSecret, options.back);
        this.scopes = ['https://www.googleapis.com/auth/drive.metadata.readonly'];
    }

    /**
     * Returned Returned the Oauth2Client to use on some realisations
     * @returns {any}
     */
    getOauth2Client(): any{
        return this.oauth2Client;
    }

    /**
     * Returned the google auth form url
     * @returns {string}
     */
    getAuthUrl(): string {
        return this.oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: this.scopes
        });
    }

    /**
     * Returned google api auth token
     * @param {string} code code from back url after google auth
     * @returns {Promise<any>}
     */
    getToken(code: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.oauth2Client.getToken(code, (err: any, tokens: any) => {
                if (err) {
                    reject({error: 'The API returned an error: ' + err});
                    return;
                }
                this.oauth2Client.setCredentials(tokens);
                resolve(tokens);
            });
        });
    }
}



