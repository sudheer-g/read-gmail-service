const google = require('googleapis');
const googleAuth = require('google-auth-library');
const fs = require('fs');
const keyStore = require('./keyStore');
const TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
const TOKEN_PATH = TOKEN_DIR + 'gmail-nodejs-quickstart.json';
const gmail = google.gmail('v1');
const emailData = require('../emailData');

// Load client secrets from a local file.
module.exports.executeMethod = function (callback) {
    fs.readFile('client_secret.json', (err, content) => {
        if (err) {
            console.log('Error loading client secret file: ' + err);
            return;
        }
        // Authorize a client with the loaded credentials, then call the
        // Gmail API.
        authorize(JSON.parse(content), callback);
    });
};

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
    const clientSecret = credentials.installed.client_secret;
    const clientId = credentials.installed.client_id;
    const redirectUrl = credentials.installed.redirect_uris[0];
    const auth = new googleAuth.GoogleAuth();
    const oauth2Client = new googleAuth.OAuth2Client(clientId, clientSecret, redirectUrl);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) {
            keyStore.getNewToken(oauth2Client, callback);
        } else {
            oauth2Client.credentials = JSON.parse(token);
            callback(oauth2Client);
        }
    });
}

/**
 * Lists the labels in the user's account.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
module.exports.listLabels  = (auth) => {

    gmail.users.labels.list({
        auth: auth,
        userId: 'me',
    }, (err, response) => {
        if (err) {
            console.log('The API returned an error: ' + err);
            return;
        }
        const labels = response.data.labels;
        if (labels.length === 0) {
            console.log('No labels found.');
        } else {
            console.log('Labels:');
            for (let i = 0; i < labels.length; i++) {
                const label = labels[i];
                console.log('- %s', label.name);
            }
        }
    });
};

function readMessage(messageId, auth) {
    gmail.users.messages.get({
        auth: auth,
        userId: 'me',
        id: messageId
    },  (err, result)  => {
        //console.log(messageId + ':' + result.data);
        console.log(result.data.payload.mimeType);
        //const encodedMessageText = result.data.payload.body.data;
        //const messageText = Buffer.from(encodedMessageText, 'base64');
        //console.log(messageText.toString())

    });
}

module.exports.getInboxList = (auth) => {
    const maxResults = 10;
    gmail.users.messages.list({
        auth: auth,
        userId: 'me',
        labelIds: ['UNREAD'],
        includeSpamTrash: false,
        maxResults: maxResults
    }, (err, response) => {
        if (err) {
            console.log('The API returned an error: ' + err);
            return;
        }
        const messages = response.data.messages;
        if (messages.length === 0) {
            console.log('No Messages found.');
        } else {
            console.log('Messages:');
            for (let i = 0; i < maxResults; i++) {
                const msgId = messages[i];
                //console.log('- %s', msgId.id);
                readMessage(msgId.id,auth);
            }
        }
    })
};

function makeBody(to, from, subject, message) {
    const str = ["Content-Type: text/plain; charset=\"UTF-8\"\n",
        "MIME-Version: 1.0\n",
        "Content-Transfer-Encoding: 7bit\n",
        "to: ", to, "\n",
        "from: ", from, "\n",
        "subject: ", subject, "\n\n",
        message
    ].join('');
    return new Buffer(str).toString("base64").replace(/\+/g, '-').replace(/\//g, '_');
}

module.exports.writeMail  = (auth) => {
    //Replace these placeholder credentials with valid credentials.
    const raw = makeBody(emailData.toEmail, emailData.fromEmail, 'Does it work with emailData file', 'It does!');
    gmail.users.messages.send({
        auth: auth,
        userId: 'me',
        resource: {
            raw: raw
        }
    })
};

