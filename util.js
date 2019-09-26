const hours = [
    {
            "text": {
                "type": "plain_text",
                "text": "7:00 AM"
            },
            "value": "07"
        },
        {
            "text": {
                "type": "plain_text",
                "text": "8:00 AM"
            },
            "value": "08"
        },
        {
        "text": {
            "type": "plain_text",
            "text": "9:00 AM"
        },
        "value": "09"
    },
    {
        "text": {
            "type": "plain_text",
            "text": "10:00 AM"
        },
        "value": "10"
    },
    {
        "text": {
            "type": "plain_text",
            "text": "11:00 AM"
        },
        "value": "11"
    },
    {
        "text": {
            "type": "plain_text",
            "text": "12:00 PM"
        },
        "value": "12"
    },
    {
        "text": {
            "type": "plain_text",
            "text": "1:00 PM"
        },
        "value": "13"
    },
    {
        "text": {
            "type": "plain_text",
            "text": "2:00 PM"
        },
        "value": "14"
    },
    {
        "text": {
            "type": "plain_text",
            "text": "3:00 PM"
        },
        "value": "15"
    },
    {
        "text": {
            "type": "plain_text",
            "text": "4:00 PM"
        },
        "value": "16"
    },
    {
        "text": {
            "type": "plain_text",
            "text": "5:00 PM"
        },
        "value": "17"
    },
    {
        "text": {
            "type": "plain_text",
            "text": "6:00 PM"
        },
        "value": "18"
    },
    {
    "text": {
        "type": "plain_text",
        "text": "7:00 PM"
    },
    "value": "19"
}
];

let getDate = function() {
    let today = new Date();
    let yyyy = String(today.getFullYear());
    let mm = String(today.getMonth()+1);
    let dd = String(today.getDate());
    today = yyyy + '-' + mm + '-' + dd;
    return today;
}

module.exports = {hours, getDate};
