
var restify = require('restify');
var builder = require('botbuilder');

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});

// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword
});

// Listen for messages from users 
server.post('/api/messages', connector.listen());

// Receive messages from the user and respond by echoing each message back (prefixed with 'You said:')
var bot = new builder.UniversalBot(connector, [
    function (session, results, next) {
        // session.beginDialog('greetings');
        next();
    },
    function (session, results) {
        session.beginDialog('requestGuestAccess');
    },
    function (session, results) {
        session.send("Results: " + JSON.stringify(results.response));
        session.endDialog(`Thank you for coming and see you!`);
    }
]);

// Ask the user for their name and greet them by name.
bot.dialog('greetings', [
    function (session) {
        builder.Prompts.text(session, 'Hi! What is your name?');
    },
    function (session, results) {
        session.endDialog(`Hello ${results.response}!`);
    }
]);

bot.dialog('requestGuestAccess', [
    function (session) {
        builder.Prompts.text(session, 'What is the name of the contractor?');
    },
    function (session, results) {
        session.dialogData.contractorName = results.response;
        builder.Prompts.time(session, 'What is the end of contract?');
    },
    function (session, results) {
        session.dialogData.contractEnd = builder.EntityRecognizer.resolveTime([results.response]);
        var result = { response: { name: session.dialogData.contractorName, end: session.dialogData.contractEnd } };
        session.endDialogWithResult(result);
    }
]).endConversationAction(
    "endRequestGuestAccess", "Ok. Goodbye.",
    {
        matches: /^cancel$|^goodbye$/i,
        confirmPrompt: "This will cancel your request. Are you sure?"
    }
);