var request = require('request');
var util = require('./util');

function viewTasks(req, res, MongoClient, db_url, token) {
    MongoClient.connect(db_url, function(err, db) {
        console.log(req.body);
        db.db("slack_bot_db").collection("tasks").find({ "channel": req.body.channel_id,}).toArray(function(err, result) {
            if (err) throw err;
            console.log(result);
            console.log(result[0].date);
            let response = [{
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "*LIST OF TASKS ASSIGNED TO #" + req.body.channel_name + " TO BE COMPLETED:*"
                }
            }];
            for (i = 0; i < result.length; i++) {
                let currDate = new Date(result[i].date);
                let assignedUsers = "";
                if (result[i].assigned == "channel") assignedUsers = "the whole channel";
                else {
                    console.log(result[i].assigned);
                    for (j = 0; j < result[i].assigned.length; j++) {
                        assignedUsers = assignedUsers + "<@" + result[i].assigned[j] + ">";
                        if (j != result[i].assigned.length-1) {
                            assignedUsers += " and "
                        }
                    }
                }
                console.log(assignedUsers);
                response.push({
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": "_• *" + result[i].task_name + "* due by *" + 
                        currDate.getMonth() + "/" + currDate.getDate() + "/" + currDate.getFullYear()+ "*, assigned to " + assignedUsers + "._", 
                    }
                })
            }
            options = {
                url: 'https://slack.com/api/chat.postMessage',
                method: 'POST',
                json: true,
                headers: {
                    'Content-type': 'application/json',
                    'Authorization': 'Bearer ' + token,
                },
                body: {
                    'channel': req.body.channel_id,
                    'text': "Here are the tasks that still need to be completed.",
                    'replace_original': true,
                    'blocks': response,
                }
            }
            request.post(options, function(err,res, body) {
                console.log(res);
            })

        })
    });
}

function createTask(req, res, new_task, token) {
    new_task['task_name'] = req.body.text;
    console.log(token);
    let options = {
        url: 'https://slack.com/api/chat.postMessage',
        method: 'POST',
        json: true,
        headers: {
            'Content-type': 'application/json; charset=utf-8',
            'Authorization': 'Bearer ' + token,
        },
        body: {
            'channel': req.body.channel_id,
            "text": "Fill out information about your task!",
            'blocks': [
                {
                    "type": "section",
                    "text": {
                    "type": "mrkdwn",
                    "text": "Please fill out the following information about your task, *" + new_task['task_name'] + "*.",
                }
                
                },
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": "*1.* By what date will your task be completed?"
                    },
                    "accessory": {
                        "type": "datepicker",
                        "action_id": "datepicker_remind",
                        "initial_date": util.getDate(),
                        "placeholder": {
                            "type": "plain_text",
                            "text": "Select a date"
                        }
                    }
                },
            ]

              }
            }
    request.post(options, function(err,res, body) {
    })

}

module.exports = {viewTasks, createTask};