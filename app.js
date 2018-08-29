//User Access Management


const express = require('express');
const path = require('path')
const bcrypt = require('bcrypt');
const jsonwebtoken = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const nodemailer = require('nodemailer');
const bodyparser = require('body-parser');
const fs = require('fs');

const { ObjectID } = require('mongodb');
const { mongoose } = require('./db/database')
const { user } = require('./schemas/user');
const { roles } = require('./schemas/roles');

const port = process.env.UAM_PORT || 9100;
const jwt_key = process.env.JWT_KEY || "alphabetagamma"
const email_id = process.env.EMAIL_ID || ""
const email_password = process.env.EMAIL_PASSWORD || ""
const email_provider = process.env.EMAIL_PROVIDER || "";

app = express();
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({
    extended: true
}))


app.use(cookieParser())

app.use(express.static(__dirname + "/public/login"));

app.get('/whoami', (req, res) => {
    // logger("API", "whoami", "", "", "success", jsonwebtoken.verify(req.cookies.token, jwt_key).userId, req.connection.remoteAddress, "GET");
    user.findById(jsonwebtoken.verify(req.cookies.token, jwt_key).userId, (err, res1) => {
        res.send('{"user":"' + res1.username + '","userId":"' + jsonwebtoken.verify(req.cookies.token, jwt_key).userId + '"}')
    })
    // user.findById("5b7fe4fa455af53e1871c179", (err, res1) => {
    //     res.send('{"user":"' + res1.username + '","userId":"' +"5b7fe4fa455af53e1871c179"  + '"}')
    // })

})


// logger = (activity, subActivity, subsubActivity, activityId, status, userId, ipAddress, method) => {
//     console.log(activity);
//     if (userId.length > 0) {
//         user.findById(userId, (err, res1) => {
//             if (res1 != undefined && res1 !== 'undefined' && res1.user != undefined && res1.user !== 'undefined') {
//                 act = new userActivity({
//                     activity, subActivity, subsubActivity, activityId, status, userId, user: res1.user.username, ipAddress, method, logDate: new Date()
//                 });
//                 act.save();

//             }


//         })

//     } else {
//         act = new userActivity({
//             activity, subActivity, subsubActivity, activityId, status, userId, user: "", ipAddress, method, logDate: new Date()
//         });
//         act.save();

//     }
// }



app.post('/register', (req, res) => {
    console.log("ABCD");
    var username = req.body.username;
    var password = req.body.password;
    var email = req.body.email;
    var mode = req.query.channel;
    user.find({ "email": email }).then((doc) => {
        if (doc.length > 0) {
            res.send({ error: "Email ID already registered" });
        } else {
            if (mode != "admin") {
                user.find({ "username": username }).then((doc) => {
                    if (doc.length > 0) {
                        if (doc[0].activated !== 'undefined' && doc[0].activated == false) {
                            res.send({ error: "User not yet activated" });
                        } else {
                            res.send({ error: "Username already exists" });
                        }
                        // logger("API", "register", "", doc[0].user.username, "failure", "", req.connection.remoteAddress, "POST");
                    }
                    else {
                        // logger("API", "register", "", "", "success", "", req.connection.remoteAddress, "POST");
                        bcrypt.hash(password, 10).then((res2) => {
                            var usr = new user({
                                username: username,
                                password: res2,
                                roles: ["index", "admin"],
                                deactivated: false,
                                activated: false,
                                email: email,
                                activationId: Math.random() * (new Date().getTime())
                            })
                            usr.save().then((res8) => {
                                sendMail(res8.email, 'Account Activation', "<h3>Dear " + res8.username + ",</h3><br><br><p>Click the link to activate your account!</p><hr><a href='https://dry-depths-41802.herokuapp.com/api/uam/activate/" + res8.activationId + "/" + res8._id + "'>Click me!</a><hr><br><br>");
                                //logger("API", "login", "", "", "success", res8._id, req.connection.remoteAddress, "POST");
                                res.send({ error: "Check your mail to verify the email address!" })
                            });
                        })
                    }
                })
            } else {
                var usr = new user({
                    username: "",
                    password: "",
                    roles: ["index", "admin"],
                    deactivated: false,
                    activated: false,
                    email: email,
                    activationId: Math.random() * (new Date().getTime())
                })
                usr.save().then((res8) => {
                    sendMail(res8.email, 'Account Activation and Username creation', "<h3>Dear " + res8.username + ",</h3><br><br><p>Click the link to activate your account and create a new username and password!</p><hr><a href='https://dry-depths-41802.herokuapp.com/api/uam/activate/" + res8.activationId + "/" + res8._id + "?channel=adminCreated'>Click me!</a><hr><br><br>");
                    //logger("API", "login", "", "", "success", res8._id, req.connection.remoteAddress, "POST");
                    res.send({ error: "OK" })
                });
            }
        }
    })
})


app.post('/logout', (req, res) => {
    //    logger("API", "logout", "", "", "success", jsonwebtoken.verify(req.cookies.token, jwt_key).userId, req.connection.remoteAddress, "POST");
    res.cookie('token', '', { httpOnly: true }).send({
        url: '',
        message: "Logout Successful",
        token: ''
    })
});


app.post('/deactivateUser/:id', (req, res) => {
    var deactivateId = req.params.id;
    user.findByIdAndUpdate(deactivateId, {
        deactivated: true
    }).then((res1) => {
        // logger("API", "deactivateUser", "", req.params.id, "success", jsonwebtoken.verify(req.cookies.token, jwt_key).userId, req.connection.remoteAddress, "POST");
        res.send(res1);
    })
})

app.post('/activateUser/:id', (req, res) => {
    var activateId = req.params.id;
    user.findByIdAndUpdate(activateId, {
        deactivated: false
    }).then((res1) => {
        // logger("API", "activateUser", "", req.params.id, "success", jsonwebtoken.verify(req.cookies.token, jwt_key).userId, req.connection.remoteAddress, "POST");
        res.send(res1);
    })
})

// app.post('/resetPassword', (req, res) => {
//     var emailId = req.body.email;
//     activationId: Math.random() * (new Date().getTime())
//     user.find({ "email": emailId }).then((res1) => {
//         user.findByIdAndUpdate(res1._id, {
//             passwordId: Math.random() * (new Date().getTime()),
//             passwordActivated: false
//         }).then((res2) => {
//             sendMail(res2.email, 'Reset Password', "<h3>Dear " + res2.username + ",</h3><br><br><p>Click the link to change your password!</p><hr><a href='https://dry-depths-41802.herokuapp.com/api/uam/resetPassword/" + res2.passwordId + "/" + res2._id + "?channel=adminCreated'>Click me!</a><hr><br><br>");

//         })


//         // logger("API", "activateUser", "", req.params.id, "success", jsonwebtoken.verify(req.cookies.token, jwt_key).userId, req.connection.remoteAddress, "POST");
//         res.send();
//     })
// })

app.delete('/deleteUser/:id', (req, res) => {
    var deleteUser = req.params.id;
    user.findByIdAndRemove(deleteUser, (err, res1) => {
        // logger("API", "deleteUser", "", req.params.id, "success", jsonwebtoken.verify(req.cookies.token, jwt_key).userId, req.connection.remoteAddress, "POST");
        res.send("OK");
    })
})


sendMail = (senderMailId, subject, html) => {
    var transporter = nodemailer.createTransport({
        // host: 'smtp.gmail.email',
        // port: 587,
        service: email_provider,
        secure: false,
        auth: {
            user: email_id,
            pass: email_password
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    var mailOptions = {
        from: email_id,
        to: senderMailId,
        subject: subject,
        html: html
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log("Could not send email!");
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}


app.get('/roles/:id', (req, res) => {
    roles.find({ _id: ObjectId(req.params.id) }).then((docs) => {
        res.send(docs);
    })
});

app.get('/roles', (req, res) => {
    var ids = req.query.ids;
    var mode = req.query.mode;
    if (mode != undefined && mode.length > 0) {
        roles.find({ "type": "participant" }).then((docs) => {
            res.send(docs);
        })
    }
    else if (ids != undefined && ids != "undefined" && ids.length > 0) {
        var search = '{"$or": [';
        oneAdded = false;
        var noNeed = [];
        for (var e = 0; e < String(ids).split(',').length; e++) {
            try {
                //ObjectId(String(ids).split(",")[e]);
                if (e != 0 && oneAdded == true) {
                    search += ",";
                }
                search += '{"roleName":"' + String(ids).split(",")[e] + '"}'
                oneAdded = true;

            }
            catch (e1) {
                noNeed.push(String(ids).split(",")[e]);
            }
        }
        search += "]}"

        roles.find(JSON.parse(search)).then((docs) => {
            var roleName = "";
            for (var e1 = 0; e1 < docs.length; e1++) {
                roleName += docs[e1].roleName + " ";
            }
            roleName += noNeed.join(" ");
            res.send(docs[0].mode);
        })
    } else {
        roles.find({}).then((docs) => {
            res.send(docs);
        })
    }
});

app.post('/roles', (req, res) => {
    var obj1 = new roles(req.body);
    obj1.save().then((doc) => {
        res.send(`${doc}`);
    })
})

app.get("/setupRoles", (req, res) => {
    var rolesSetup = [{roleName:"workitems",type:"",mode:""},{roleName:"process",type:"",mode:""},{roleName:"listObjects",type:"",mode:""},
    {roleName:"listProcess",type:"",mode:""},{roleName:"objectViewer",type:"",mode:""},{roleName:"objectBuilder",type:"",mode:""},
    {roleName:"listForms",type:"",mode:""},{roleName:"index",type:"",mode:""},{roleName:"header",type:"",mode:""},
    {roleName:"formBuilder",type:"",mode:""},{roleName:"admin",type:"",mode:""},{roleName:"test",type:"",mode:""},
    {roleName:"maker",type:"participant",mode:"edit"},{roleName:"checker",type:"participant",mode:"view"},{roleName:"listInstances",type:"",mode:""}];
    for (var i = 0; i < rolesSetup.length; i++) {
        var role=new roles({
            _id:rolesSetup[i].roleName,
            roleName:rolesSetup[i].roleName,
            type:rolesSetup[i].type,
            mode:rolesSetup[i].mode
        })
        role.save().then((res)=>{
            console.log(res._id+" is saved!");
        })
    }
    res.send({ "status": "Role insertion initiated" })
})


app.get('/user', (req, res) => {
    user.find({}).then((docs) => {
        res.send(docs);
    })
});

// app.get('/user/:id', (req, res) => {
//     req.params.id = req.params.id.replace("_", "")
//     user.findById(req.params.id, (err, docs) => {
//         res.send({
//             user: docs.username
//         })
//     })
// });

app.get('/user/:id', (req, res) => {
    console.log(req.params.id)
    user.findById(req.params.id, (err, docs) => {
        res.send(docs)
    })
});

app.post('/user', (req, res) => {
    var obj1 = new user(req.body);
    obj1.save().then((doc) => {
        res.send(`${doc}`);
    })
})

app.put('/user/:id', (req, res) => {
    id = req.params.id;
    console.log("AAA");
    user.findByIdAndUpdate(id, {
        roles: req.body.roles
    }).then((res1) => {
        res.send(res1);
    })


});

app.put('/user', (req, res) => {
    var password = req.body.newPassword
    var id = jsonwebtoken.verify(req.cookies.token, jwt_key).userId;
    bcrypt.hash(password, 10).then((res3) => {
        user.findByIdAndUpdate(id, {
            password: res3
        }).then((res1) => {
            res.send(res1);
        })

    });
})

app.get('/login', (req, res) => {
    //logger("page", "login", "", "", "success", "", req.connection.remoteAddress, "GET");
    res.sendFile(__dirname + '/public/login/login.html')
})

app.post('/login', (req, res) => {


    user.find({ "username": req.body.username }).then((res1) => {
        if (res1.length > 0) {
            bcrypt.compare(req.body.password, res1[0].password).then((res2) => {
                if (res1[0].deactivated == true) {
                    //logger("API", "login", "", "", "deactivated", res1[0]._id, req.connection.remoteAddress, "POST");

                    res.send({
                        deactivated: true,
                        url: '/login.html',
                        message: "User has been deactivated!"
                    })
                } else if (res1[0].activated == false) {
                    //logger("API", "login", "", "", "notactivated", res1[0]._id, req.connection.remoteAddress, "POST");

                    res.send({
                        notactivated: true,
                        url: '/login.html',
                        message: "User is not yet activated!"
                    })
                } else if (res2 == true) {
                    //logger("API", "login", "", "", "success", res1[0]._id, req.connection.remoteAddress, "POST");

                    token = jsonwebtoken.sign({ userId: res1[0]._id }, jwt_key, {
                        expiresIn: '1H'
                    })

                    // fs.readFile('public/login/successfulLogin.html', function (err, data) {
                    //     data = data.toString().replace("##USER##", res1[0].username);

                    //     res.writeHead(200, { 'Content-Type': 'text/html' });
                    //     res.write(data);
                    //     res.end();
                    // });

                    var sendBackUrl = process.env.successfulLoginURL || '/successfulLogin.html?user=' + res1[0].username;

                    res.cookie('token', token, { httpOnly: true }).send({
                        url: sendBackUrl,
                        token: token,
                        message: "Successful Login!"
                    })

                }
                else {
                    //logger("API", "login", "", "", "someotherfailure", res1[0]._id, req.connection.remoteAddress, "POST");

                    res.send({
                        url: '/login.html',
                        message: "Not Successful Login!"
                    })
                }
            })
        } else {
            //logger("API", "login", "", "", "failure", req.body.username, req.connection.remoteAddress, "POST");

            res.send({
                url: '/login.html',
                message: "Not Successful Login!"
            })
        }
    })



})

app.get('/activate/:activationId/:userId', (req, res) => {
    activateDeactivate(req, res)

})


app.post('/activate/:activationId/:userId', (req, res) => {
    activateDeactivate(req, res)
})

activateDeactivate = (req, res) => {
    userId = req.params.userId;
    activationId = req.params.activationId;
    channel = req.query.channel
    user.findById(req.params.userId, (err, res1) => {

        if (res1 != undefined && res1 !== 'undefined' && res1.activationId == activationId) {
            if (res1.activated == false && channel == "username") {
                var username = req.body.username
                var password = req.body.password
                user.find({ "username": username }).then((users) => {
                    if (users.length > 0) {
                        res.send({ error: "User Id is already taken!" })
                    } else {
                        bcrypt.hash(password, 10).then((res2) => {
                            password = res2;
                            user.findByIdAndUpdate(userId, {
                                "username": username,
                                "password": password,
                                "activated": true
                            }, (err, res43) => {
                                res.writeHeader(200, { "Content-Type": "text/html" });
                                res.write("Activated! <a href='/login'>Click here to login!</a>");
                                res.end();
                            })
                        });

                    }
                })



            } else if (res1.activated == false && channel == "adminCreated") {
                fs.readFile('activation.html', function (err, data) {
                    data = data.toString().replace("##userId##", res1._id);
                    data = data.toString().replace("##emailId##", res1.email);
                    data = data.toString().replace("##activationId##", res1.activationId);

                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.write(data);
                    res.end();
                });
            } else if (res1.activated == false) {
                user.findByIdAndUpdate(req.params.userId, {
                    activated: true
                }, (err, res2) => {
                    res.writeHeader(200, { "Content-Type": "text/html" });
                    res.write("Activated! <a href='/login'>Click here to login!</a>");
                    res.end();

                })

            } else {
                res.writeHeader(200, { "Content-Type": "text/html" });
                res.write("User already activated! <a href='/login'>Click here to login!</a>");
                res.end();
            }
        } else {
            res.writeHeader(200, { "Content-Type": "text/html" });
            res.write("Invalid Content! <a href='/login'>Click here to login!</a>");
            res.end();


        }
    })
}


app.post('/resendActivationLink', (req, res) => {
    var email = req.body.email;

    user.find({ "email": email }).then((users) => {
        if (users.length > 0) {
            if (users[0].activated == false) {
                sendMail(users[0].email, 'Account Activation', "<h3>Dear " + users[0].username + ",</h3><br><br><p>Click the link to activate your account!</p><hr><a href='https://dry-depths-41802.herokuapp.com/api/uam/api/uam/activate/" + users[0].activationId + "/" + users[0]._id + "'>Click me!</a><hr><br><br>");
                res.send({ status: "OK", message: "Check your mail to verify the email address!" })

            } else {
                res.send({ status: "OK", message: "user already activated!" })
            }
        } else {
            res.send({ status: "ERROR", message: "user not yet registered!" })
        }
    })





})


app.listen(port, "0.0.0.0", () => {
    console.log("UAM started at-" + port);
})