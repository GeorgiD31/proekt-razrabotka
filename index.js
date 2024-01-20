const express = require('express');
const bodyParser = require('body-parser');
const parser = require('body-parser');
const port = 8080;
const app = express();
const mysql = require('mysql');
var whitelist = {};
// Commands can be to login, create a new user, or message a user, or receive all messages pending to be read.
// The server should find the user if they want to log in and compare "hashed" passwords.
// If the given credentials are valid, add the IP to the whitelist and corresponding user_id to the IP.
// When messaging, we want to message by username. The request should contain the message.
// On creating an account, the server should write the necessary information into the database.

//login needs command username and password 
//message needs reciver message and sender
// recieve needs just command 
//signin 
var con = mysql.createConnection({
    host: '127.0.0.1',
    port: '3306',
    user: 'root',
    password: 'toor',
    database: 'gosho'
});

function create_account(username, email, password, name, res) {

    con.query("Select UserId FROM userstable WHERE UserName = \'" + String(username) + "\'", function(err, result, fields) {
        if (err) {
            res.status(200).send({
                respons: 'Internal error!'
            })
            throw err;
        }
        console.log(result.length)
        if(result.length == 0) // if there is no user with that username
        {
            con.query("INSERT INTO UsersTable (UserName, HashedPassword, Email, Name) VALUES('" + username + "', '" + password + "', '" + email +"', '" + name + "');", function(err, result, fields) {
                if (err) {
                    res.status(200).send({
                        respons: 'Internal error!'
                    })
                    throw err;
                }
                res.status(200).send({
                    respons: "Added successfully"
                })
            });

        }else{
            res.status(200).send({
                respons: 'Username already exists'
            })
        }
    });
}

function log_in(username, password, req, res) {
    con.query("SELECT HashedPassword FROM userstable WHERE UserName = \'" + String(username) + "\';", function(err, result, fields) {

        if (err) {
            res.status(200).send({
                respons: 'Internal error!'
            })
            throw err;
        }
        if (result[0]["HashedPassword"] == String(password)) {
            console.log("login succsesgull!");
            res.status(200).send({
                respons: 'Login successful'
            })
            whitelist[req.ip] = username;
        } else {
            res.status(200).send({
                respons: 'Incorect username and password! \n If you dont have account please register first!'
            })
        }
    });


}


function message(username, sender, message, res) {
    var user_id = 0;
    var sender_id = 0;
    con.query("Select UserId FROM userstable WHERE UserName = \'" + String(username) + "\'", function(err, result, fields) {

        if (err) {
            res.status(200).send({
                respons: 'Internal error!'
            })
            throw err;
        }
        user_id = result[0]["UserId"];

        con.query("Select UserId FROM userstable WHERE UserName = \'" + String(sender) + "\'", function(err, result, fields) {

            if (err) {
                res.status(200).send({
                    respons: 'Internal error!'
                })
                throw err;
            }
            sender_id = result[0]["UserId"];

            con.query("INSERT INTO `messages` (`Msg`, `Sender_id`, `Receiver_id`) VALUES (\'" + message + "', " + sender_id + ", " + user_id + ");", function(err, result, fields) {
                console.log("Inserted successfully");

                if (err) {
                    res.status(200).send({
                        respons: 'Internal error!'
                    })
                    throw err;
                }

                res.status(200).send({
                    respons: 'Inserted successfully!'
                })
            });
        });
    });


}

function receive_message(req,user,res) {
    con.query("Select UserId FROM userstable WHERE UserName = \'" + String(user) + "\'", function(err, result, fields) {
        id = result[0]["UserId"];
        if (err) {
            res.status(200).send({
                respons: 'Internal error!'
            })
            throw err;
        }

        con.query("SELECT * FROM `messages` WHERE `Receiver_id` = " + id + ";", function(err, result, fields) {

            if (err) {
                res.status(200).send({
                    respons: 'Internal error!'
                })
                throw err;
            }
            res.status(200).send({
                respons: result
            })
        });
    });
    
}

con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
});

app.listen(
    port,
    () => console.log("SERVER ALLIVE!!")
)

app.use(parser.json());

app.get('/', (req, res) => {
    console.log(req.body["command"])
    if (req.body["command"] == "login") {

        if (!whitelist.hasOwnProperty(req.ip)) {

            log_in(req.body["username"], req.body["password"], req, res);
        } else {
            res.status(200).send({
                respons: 'You are already logged in!'
            })
        }

    } else if (req.body["command"] == "signin") {
        create_account(req.body["username"],req.body["email"],req.body["password"],req.body["name"],res);
    } else if (req.body["command"] == "send") {

        if (whitelist.hasOwnProperty(req.ip)) {
            message(req.body["username"], whitelist[req.ip], req.body["message"], res);
        } else {
            res.status(200).send({
                respons: "You need to login to send messages!"
            })
        }
    } else if (req.body["command"] == "receive") {

        if (whitelist.hasOwnProperty(req.ip)) {
            receive_message(req,whitelist[req.ip],res);
        } else {
            res.status(200).send({
                respons: "You need to login to recieve messages!"
            })
        }
    } else {
        res.status(200).send({
            respons: "You have incorect command parameter!"
        })
    }


});