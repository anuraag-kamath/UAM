var mongoose = require('mongoose');
var user = mongoose.model("user", {
    "email": { "type": "String" },
    "activationId": { "type": "String" },
    "activated": { "type": "Boolean" },
    "username": { "type": "String" },
    "deactivated": { "type": "Boolean" },
    "password": { "type": "String" },
    "roles": [{ "type": "String" }],
    "instanceId": { "type": "String" },
    "passwordId": { "type": "String" },
    "passwordActivated": { "type": "Boolean" }
});
module.exports = { user } 