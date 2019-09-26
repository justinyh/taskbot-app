var util = require("./util.js");

let optionBody2 = {
    'replace_original': true,
    'blocks': [
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": "*2.* By what time will your task be completed?"
            },
            "accessory": {
                "type": "static_select",
                "action_id": "hour_select",
                "placeholder": {
                    "type": "plain_text",
                    "text": "Select a time"
                },
                "options": util.hours,
            },
                
        },
    ]
};

let optionBody3 = {
    'replace_original': true,
    'blocks': [
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": "*3.* Which channel will be responsible for this task?"
            },
            "accessory": {
                "type": "channels_select",
                "action_id": "channel_select",
                "placeholder": {
                    "type": "plain_text",
                    "text": "Select a channel"
                },
            },
    }
    ]
};

let optionBody4 = {
    'replace_original': true,
    'blocks': [
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": "*4.* Would you like to assign the task to the whole channel or certain individuals?"
            },
            "accessory": {
                "type": "static_select",
                "action_id": "channel_user_select",
                "placeholder": {
                    "type": "plain_text",
                    "text": "Channel or individuals?"
                },
                "options": [{
                    "text": {
                        "type": "plain_text",
                        "text": "Channel"
                    },
                    "value": "channel"
                },
                {
                    "text": {
                        "type": "plain_text",
                        "text": "Individuals"
                    },
                    "value": "users"
                }
            ]
            
        }
            
        }
    ]
}

function optionBody5(selectors) {
    return {
        'replace_original': true,
        'blocks': [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "*5.* Please select up to five users who will be assigned the task."
                },
            },
            {
                "type": "actions",
                "elements": selectors,
                
            }
        ]
    }
}


function optionBodyFinish(new_task) {
    return {
        'replace_original': true,
        'text': new_task["task_name"] + " has been added to your list of tasks.",
        'blocks': [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "Your task *" + new_task["task_name"] + "* has been added."
                },
                
            }
        ]
    }
}

module.exports = { optionBody2, optionBody3, optionBody4, optionBody5, optionBodyFinish};