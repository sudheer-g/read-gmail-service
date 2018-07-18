function base64ToText(encodedMessageText) {
    return Buffer.from(encodedMessageText, 'base64').toString();
}

function getPlainTextFromPayload(payload) {
    let encodedMessageText = '';
    switch (payload.mimeType) {
        case 'text/plain':
            encodedMessageText = payload.body.data;
            break;
        case 'multipart/mixed':
        case 'multipart/alternative':
        case 'multipart/digest':
        case 'multipart/related':
            encodedMessageText = getPlainTextFromPayload(payload.parts[0]);
            break;
        default:
            console.log("Unsupported MIME format: " + mimeType);
    }
    return encodedMessageText;
}

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

module.exports = {
    base64ToText: base64ToText,
    getPlainTextFromPayload: getPlainTextFromPayload,
    makeBody: makeBody
};