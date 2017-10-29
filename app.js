/*-----------------------------------------------------------------------------
A simple echo bot for the Microsoft Bot Framework. 
-----------------------------------------------------------------------------*/

var restify = require('restify');
var builder = require('botbuilder');
var request = require('request');
var fs = require('fs');

var firebase = require('firebase');

var config = {
    apiKey: "AIzaSyBsMgdDod5MxNPLkfp1-D4AE19Hx2XZMNE",
    authDomain: "surebot-53ceb.firebaseapp.com",
    databaseURL: "https://surebot-53ceb.firebaseio.com",
    projectId: "surebot-53ceb",
    storageBucket: "surebot-53ceb.appspot.com",
  };

firebase.initializeApp(config);

var database = firebase.database();

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});
  
// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword,
    stateEndpoint: process.env.BotStateEndpoint,
    openIdMetadata: process.env.BotOpenIdMetadata 
});

// Listen for messages from users 
server.post('/api/messages', connector.listen());


/*----------------------------------------------------------------------------------------
* Bot Storage: This is a great spot to register the private state storage for your bot. 
* We provide adapters for Azure Table, CosmosDb, SQL Azure, or you can implement your own!
* For samples and documentation, see: https://github.com/Microsoft/BotBuilder-Azure
* ---------------------------------------------------------------------------------------- */

// Create your bot with a function to receive messages from the user
var bot = new builder.UniversalBot(connector, function (session){
    session.send('Sorry, I didn\'t get understand that! What do you mean?');
});

// Make sure you add code to validate these fields
var luisAppId = process.env.LuisAppId;
var luisAPIKey = process.env.LuisAPIKey;
var luisAPIHostName = process.env.LuisAPIHostName || 'westus.api.cognitive.microsoft.com';

const LuisModelUrl = 'https://' + luisAPIHostName + '/luis/v1/application?id=' + luisAppId + '&subscription-key=' + luisAPIKey;

// Main dialog with LUIS
var recognizer = new builder.LuisRecognizer(LuisModelUrl);
bot.recognizer(recognizer);

bot.dialog('Greeting', [
    function (session) {
        session.send("Hi, I'm SUREBot! I'm here to make your SUREWalk experience simple and fast.");
        builder.Prompts.text(session, "Let's get started. What is your first name?");
    }, 
    function (session, results) {
        session.dialogData.userName = results.response;
        builder.Prompts.text(session, `Hi, ${session.dialogData.userName}. What is your UT EID?`);
    },
    function(session, results) {
        session.dialogData.eid = results.response;
        builder.Prompts.text(session, "Great. Where do you want to be picked up?")  
    },
    function (session, results) {
        session.dialogData.pickUp = results.response;
        builder.Prompts.text(session, "Gotcha. Now, to what address do you want to go?");
    },
    function (session, results) {
        session.dialogData.dropOff = results.response;
        builder.Prompts.text(session, "Great! One last thing, what’s the best number to contact you at?");
    },
    function (session, results){
        session.dialogData.phone = results.response;
        session.send("Thanks! Someone from SUREWalk will contact you soon! :) Hook’em \\m/");
        session.dialogData.volunteer = "Bot";
        session.dialogData.status = "Open";
        firebase.database().ref('riders/' + session.dialogData.eid).set({
            username: session.dialogData.userName,
            eid: session.dialogData.eid,
            pickup_location: session.dialogData.pickUp,
            dropoff_location: session.dialogData.dropOff,
            phone_number: session.dialogData.phone,
            volunteer: session.dialogData.volunteer,
            status: session.dialogData.status
        });
        console.log(JSON.stringify(session.dialogData));
        session.endDialog();
    }]).triggerAction({
        matches: ['Greeting']
    });
