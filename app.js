const gmailConfig = require('./config/gmail');
const keyStore = require('./config/keyStore');

gmailConfig.executeMethod(gmailConfig.getInboxList);