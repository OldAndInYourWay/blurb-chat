var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;

app.use(express.static(__dirname + "/public"));

server.listen(port, function(){
    console.log("Server is listening at port " + port);
    lifespan();
});

var connectedUsers = {};
var numUsers = 0;

/***********************************************************************
 * FILE SYSTEM / LIFE
 ************************************************************************/

var fs = require('fs');
var readline = require('readline');
var date = new Date();
var current_hour = date.getHours();
var fileName = "chatlog_" + date.getDate() + date.getMonth() + date.getYear() + "_" + date.getHours() + date.getMinutes() + date.getMilliseconds();

//Setup Readline
var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

//Setup Log
global.stream = fs.createWriteStream(__dirname + "/logs/" + fileName);
global.stream.write("************************************************\n");
global.stream.write("********************chat log********************\n");
global.stream.write("************************************************\n");
global.stream.write("\n");
global.stream.write("Date: " + date.getDate() + "/" + date.getMonth() + "/" + date.getYear() + "\n");
global.stream.write("Time: " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + "\n");
global.stream.write("\n");
global.stream.write("\n");

var flushAndStartStream = function(){
    global.stream.end();

    var date = new Date();
    var fileName = "chatlog_" + date.getDate() + date.getMonth() + date.getYear() + "_" + date.getHours() + date.getMinutes() + date.getMilliseconds();

    global.stream = fs.createWriteStream(__dirname + "/logs/" + fileName);
    global.stream.write("************************************************\n");
    global.stream.write("********************chat log********************\n");
    global.stream.write("************************************************\n");
    global.stream.write("\n");
    global.stream.write("Date: " + date.getDate() + "/" + date.getMonth() + "/" + date.getYear() + "\n");
    global.stream.write("Time: " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + "\n");
    global.stream.write("\n");
    global.stream.write("\n");
};

//Handles the life of the code
var lifespan = function(){
    rl.question("1) ENTER 'STOP' TO STOP AND WRITE FILE", function(answer) {
        if(answer === "STOP"){
            global.stream.end();
            rl.close();
            process.exit();
        } else if(answer === "q"){
            flushAndStartStream();
            lifespan();
        }  else {
            lifespan();
        }
    });
};

//Daily Logger
var dailyLog = function(){
    setInterval(function(){
        var date = new Date();
        var hours = date.getHours() + "";
        var mins = date.getMinutes() + "";

        //At 11PM everyday, we will push a new log of the chats
        if(hours === "22" && mins === "59"){
            flushAndStartStream();
            console.log("\nDAILY LOGGER: Logged a new file of the chat for today's date.");
        }

    }, 100000);
};
dailyLog();

var log = function(text){
    global.stream.write(text + "\n");
};

/***********************************************************************
 * SOCKET HANDLING
 ************************************************************************/

io.on('connection', function(socket){
   console.log("A new client joined");
    socket.ipAddress = socket.request.connection.remoteAddress;

    socket.on('username', function(username){
        //Escape Bad Text
        username = username.replace(/</g, "&lt;").replace(/>/g, "&gt;");

        //Check if username already taken
        if(connectedUsers[username] != undefined){
            socket.emit('confirm username', {
                confirm: false
            });

        //If username not already taken
        } else {
            socket.emit('confirm username', {
                confirm: true
            });

            console.log('Client has named themselves "' + username + ' via ' + socket.ipAddress);

            var addUsername = function (callback) {
                socket.username = username;
                connectedUsers[username] = socket;
                numUsers++;
                log(username + " joined the chat! ---------> [LOG: " + username + " - CLIENT IP ADDRESS: " + socket.ipAddress + "]");

                callback();
            };

            addUsername(function () {
                socket.emit('update user count', {
                    numUsers: numUsers
                });

                //Broadcast to everyone:
                // 1) the new amount of users
                // 2) the Name of the new user
                socket.broadcast.emit('new user joined', {
                    username: socket.username,
                    numUsers: numUsers
                });
            });
        }
    });

        //Inform user how many others are in chat room
        socket.emit('numUsers', {
           numUsers: numUsers
        });


        socket.on('disconnect', function(){
            console.log(socket.username  + "(" + socket.ipAddress + ")"+ " disconnected");

            if(numUsers != 0) {
                numUsers--;
            }

            var personWhoLeft = socket.username  + "";
            if(personWhoLeft== undefined){
                personWhoLeft = "Someone who didn't get far enough to get a name ";
                log(personWhoLeft + " left.");
            }

            socket.broadcast.emit('user left', {
                username: personWhoLeft,
                numUsers: numUsers
            });

            delete connectedUsers[socket.username];

        });

        socket.on('message', function(data){
           var message = data.message;

            //Escape bad text
            message = message.replace(/</g, "&lt;").replace(/>/g, "&gt;");
            socket.broadcast.emit('message', {
               username: socket.username,
               message: message
           });

            log(socket.username + ": " + data.message);
        });
});

