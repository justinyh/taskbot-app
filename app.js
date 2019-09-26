var express = require('express');
var request = require('request');
const { createMessageAdapter } = require('@slack/interactive-messages');
const bodyParser = require('body-parser');
const fs = require('fs');

var mongo = require('mongodb');
var MongoClient = require('mongodb').MongoClient;
var db_url = "mongodb://localhost:27017/slack_bot_db";

var taskHandler = require('./taskHandler');
var optionBodies = require('./optionBodies')

const port = process.env.PORT || 3000;

const app = express();
const token = process.env.SLACK_BOT_TOKEN;
const signingsecret = process.env.SLACK_SIGNING_SECRET;

const TOKEN_PATH = 'token.json';
const HOUR_PATH = 'hours.json';
const BOT_TOKEN = process.env.SLACK_BOT_TOKEN;
var authenticated = false;
var content;

var new_task = {};

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/******* READS TOKEN IF EXISTS *****************/
fs.readFile(TOKEN_PATH, (err, data) => { // add functionality to check if it exists. needs to handle error
    content = JSON.parse(data);
    authenticated = true;
  });

console.log(authenticated);



/****** APP INSTALLATION **************************/
app.get('/auth', (req, res) =>{
    res.sendFile(__dirname + '/add_to_slack.html')
});

app.get('/redirect_uri', (req, res) =>{
    res.send('Authenticated!');
})

app.get('/auth/redirect', (req, res) =>{
    var options = {
        uri: 'https://slack.com/api/oauth.access?code='
            +req.query.code+
            '&client_id='+process.env.CLIENT_ID+
            '&client_secret='+process.env.CLIENT_SECRET,
            //+'&redirect_uri='+process.env.REDIRECT_URI,
        method: 'GET'
    }
    request(options, (error, response, body) => {
        var JSONresponse = JSON.parse(body)
        if (!JSONresponse.ok){
            console.log(JSONresponse)
            res.send("Error encountered: \n"+JSON.stringify(JSONresponse)).status(200).end()
        }else{
            try {
                fs.writeFileSync(TOKEN_PATH, JSON.stringify(JSONresponse))
              } catch (err) {
                console.error(err)
              }
            }
            res.send("Success!")
        })
    })



/*************** MENU ************************/
/*
function menu(req, res) {
    res.status(200).send();
    let options = {
        url: content.incoming_webhook.url,
        method: 'POST',
        json: true,
        headers: {
            'Content-type': 'application/json',
        },
        body: {
            'blocks': [
                {
                    "type": "section",
                    "text": {
                    "type": "mrkdwn",
                    "text": `Hi <@${req.body.user_id}>! What would you like to do?`
                    }
                },
                {
                    "type": "actions",
                    "elements": [
                    {
                        "type": "button",
                        "action_id": "link_calendar",
                        "text": {
                        "type": "plain_text",
                        "text": "Link a Google Calendar"
                        }
                    },
                    {
                        "type": "button",
                        "action_id": "create_task",
                        "text": {
                        "type": "plain_text",
                        "text": "Create a new task"
                        }
                    },
                    {
                        "type": "button",
                        "action_id": "view_tasks",
                        "text": {
                        "type": "plain_text",
                        "text": "View tasks"
                        }
                    }
                    ]
                }
            ]
        }
    };
    request.post(options, function(err, res, body) {
        console.log(body);
    });
    
}
*/

function finishAndInsert(options) {
        var to_insert = JSON.parse(JSON.stringify(new_task));
        MongoClient.connect(db_url, function(err, db) {
            if (err) throw err;
            var dbo = db.db("slack_bot_db");
            dbo.collection("tasks").insertOne(to_insert, function(err, res) {
                if (err) throw err;
                console.log("inserted into database");
                db.close();
            });
        });
        options.body = optionBodies.optionBodyFinish(new_task);
        new_task = {};
}


app.post('/events', function(req, res){
    if (req.body.type == 'url_verification') res.status(200).send(req.body.challenge);
})

app.post('/interactive', function(req,res) {
    res.status(200).send('');
    let body = JSON.parse(req.body.payload);
    console.log(body);
    let options = {
        url: body.response_url,
        method: 'POST',
        json: true,
        headers: {
            'Content-type': 'application/json'
        }
    };
    if (body.actions[0].action_id == 'datepicker_remind') {
        new_task['date'] = body.actions[0].selected_date;
        fs.readFile(TOKEN_PATH, (err, data) => { // add functionality to check if it exists. needs to handle error
            content = JSON.parse(data);
            authenticated = true;
          });
        options.body = optionBodies.optionBody2;
    }
    else if (body.actions[0].action_id == 'hour_select') {
        console.log(body.actions[0].selected_option);
        let date =[Number(new_task['date'].slice(0,4)), Number(new_task['date'].slice(5,7)), Number(new_task['date'].slice(8,10))];
        new_task['date'] = new Date(date[0], date[1], date[2], Number(body.actions[0].selected_option.value));
        console.log(new_task['date']);
        options.body = optionBodies.optionBody3;
    }
    else if (body.actions[0].action_id == 'channel_select') {  
        new_task['channel'] = body.actions[0].selected_channel;
            options.body = optionBodies.optionBody4;
        }
     else if (body.actions[0].action_id == 'channel_user_select') {
        if (body.actions[0].selected_option.value == 'users') {
                let selectors = [];
                for (i = 0; i < 5; i++) {
                    selectors.push({
                        "type": "users_select",
                        "action_id": "assigned_select" + i.toString(),
                        "placeholder": {
                            "type": "plain_text",
                            "text": "Select a user"
                        },
                    });
                }
                selectors.push( {
                    "type": "button",
                    "action_id": "done",
                    "text": {
                        "type": "plain_text",
                        "text": "Done"
                    }
                })
                console.log(selectors);
                options.body = optionBodies.optionBody5(selectors);
            }
        else if (body.actions[0].selected_option.value == 'channel') {
            new_task['assigned'] = 'channel';
            finishAndInsert(options);
        }
    }
    

    else if (body.actions[0].type == 'users_select') {
        console.log(new_task);
        if (new_task['assigned'] == undefined) {
            new_task['assigned'] = [];
        }
        new_task['assigned'].push(body.actions[0].selected_user);
        console.log(new_task['assigned']);
    }
    else if (body.actions[0].action_id == 'done') {
        finishAndInsert(options);
    }
    /*
    else if (body.actions[0].action_id == 'users_select') {
        new_task['assigned_user'] = body.actions[0].selected_user;
        options = {
            url: body.response_url,
            method: 'POST',
            json: true,
            headers: {
                'Content-type': 'application/json'
            },
            body: {
                'replace_original': true,
                'blocks': [
                    {
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            "text": "*4.* Would you like to set a reminder for the task?"
                        },
                        "accessory": {
                            "type": "static_select",
                            "action_id": "hour_select",
                            "placeholder": {
                                "type": "plain_text",
                                "text": "Select a time"
                            },
                            "options": {
                                "text": {
                                    "type": "plain_text",
                                    "text": "Three days before"
                                }
                                hours,
                        },
                        
                    }
                ]
            }
    }*/
    request.post(options, function(err,res, body) {

    })

})


/************* HANDLES SLASH COMMANDS ******************/
app.post('/slack/commands', function(req, res) {
    res.status(200).send();
    if (req.body.command == '/newtask') {
        console.log(req.body);
        taskHandler.createTask(req, res, new_task, token);
    }
    else if (req.body.command == '/viewtasks') {

        taskHandler.viewTasks(req, res, MongoClient, db_url, token);
    }
});

app.listen(port, () => console.log(`App listening on port ${port}.`));