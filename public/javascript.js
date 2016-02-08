$(document).ready(function() {
    //var socket = io('https://floating-bastion-98876.herokuapp.com:3000/');
    var socket;
    var location = window.location;
    alert(window.location);
    console.log(location);
    if(location = "http://localhost:3000/") {
        socket = io("http://localhost:3000");
    } else {
        socket = io.connect();
    }
    var $usernameForm = $('#username-form');
    var $numberOfUsersDisplay = $('#chat-info');
    var $chatMessages = $('.messages');
    var username = "";
    var $invalid = $('#invalid');

    //****************************************************************//
    var isActive;
    var messageSound;
    var joinedSound;

    var context = new(window.AudioContext || window.webkitAudioContext || window.oAudioContent || window.msAudioContext)();
    var soundOn = true;

    var getMessageSound = new XMLHttpRequest();
    getMessageSound.open("GET", "sounds/message.mp3", true);
    getMessageSound.responseType = "arraybuffer";
    getMessageSound.onload = function () {
        context.decodeAudioData(getMessageSound.response, function (buffer) {
            messageSound = buffer;
        });
    };
    getMessageSound.send();

    var getJoinedSound = new XMLHttpRequest();
    getJoinedSound.open("GET", "sounds/joined.mp3", true);
    getJoinedSound.responseType = "arraybuffer";
    getJoinedSound.onload = function () {
        context.decodeAudioData(getJoinedSound.response, function (buffer) {
            joinedSound = buffer;
        });
    };
    getJoinedSound.send();

    window.onfocus = function () {
        isActive = true;

        //change the title of the page to blurb
        document.title = "blurb";
    };

    window.onblur = function () {
        isActive = false;
    };

    //Toggle Sound on and off
    var clickBlock = false;
    $('#sound').click(function() {
        if(clickBlock === false){
            clickBlock = true;
            if (soundOn) {
                soundOn = false;
                $('#sound-notification').text("Sounds are now off!");
                $('.notification').animate({
                    top: '10px'
                }, 500, function () {
                    setTimeout(function () {
                        $('.notification').animate({
                            top: '-15px'
                        }, 500);
                    }, 1000);
                    clickBlock = false;
                });
            } else {
                soundOn = true;
                $('#sound-notification').text("Sounds are now on!");
                $('.notification').animate({
                    top: '10px'
                }, 500, function () {
                    setTimeout(function () {
                        $('.notification').animate({
                            top: '-15px'
                        }, 500);
                    }, 1000);
                    clickBlock = false;
                });
            }
        }
    });


    //****************************************************************//

    $usernameForm.focus();

    //Enter Username
    $("#login-form").keypress(function (event) {
        $invalid.css("visibility", "hidden");
        if (event.which == 13) {
            event.preventDefault();
            username = $("#username-form").val();
            username = username.replace(/</g, "&lt;").replace(/>/g, "&gt;");

            //If Blank Username
            if (username === "") {
                $invalid.html("Enter a valid username");
                $invalid.css("visibility", "visible");

                //If Username not blank, ask if OK
            } else {
                socket.emit('username', $("#username-form").val());
            }
            return false;
        }
    });

    function sanitize(input) {
        return $('<div/>').text(input).text();
    }

    var goToBottom = function () {
        var objDiv = document.getElementById("chat-body");
        objDiv.scrollTop = objDiv.scrollHeight;
    };

    socket.on('confirm username', function (data) {
        if (data.confirm === true) {
            $("#username-form").val("");
            $('#hello').fadeOut();
            $('#chat').fadeIn();
            $("#chatbox").focus();
        } else {
            //Username already taken
            $invalid.html("That name is already taken");
            $invalid.css("visibility", "visible");
        }

    });

    //Display the Number of users
    socket.on('numUsers', function (data) {
        $numberOfUsersDisplay.html("THERE ARE CURRENTLY " + data.numUsers + " IN THE CHAT");
    });

    //Handle when a new user joins. The number of users changes too.
    socket.on('new user joined', function (data) {
        if (!isActive) {
            //Make different alert sound
            playSound(joinedSound);

            //Update the title of the page that someone joined
            document.title = "blurb - " + data.username + " joined the chat!";
        }

        $numberOfUsersDisplay.html("THERE ARE CURRENTLY " + data.numUsers + " IN THE CHAT");
        $chatMessages.append("<li>" + sanitize(data.username) + " joined the chat!</li>");
        goToBottom();
    });

    socket.on('update user count', function (data) {
        $numberOfUsersDisplay.html("THERE ARE CURRENTLY " + data.numUsers + " IN THE CHAT");
    });

    socket.on('user left', function (data) {
        $numberOfUsersDisplay.html("THERE ARE CURRENTLY " + data.numUsers + " IN THE CHAT");

        if (data.username === undefined) {
            $chatMessages.append("<li>Someone without a name yet left the chat.</li>");
        } else {
            $chatMessages.append("<li>" + sanitize(data.username) + " left the chat.</li>");
        }

        goToBottom();
    });

    socket.on('message', function (data) {
        var message = data.message;
        var user = data.username;

        if (!isActive) {
            //Make alert sound
            playSound(messageSound);

            //Update the title of the page to whoever messaged
            document.title = windowtitle = "blurb - " + user + " just sent a message!";
        }

        $chatMessages.append("<li>" + sanitize(data.username) + ": " + message + "</li>");
        goToBottom();
    });

    $("#chatbox").keypress(function (event) {
        if (event.which == 13) {
            event.preventDefault();
            var text = $("#chatbox").val();

            if (text !== "") {

                //Escape bad text (If you change this, you're only hurting yourself: so just dont.)
                text = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");

                $("#chatbox").val("");

                socket.emit('message', {
                    message: text
                });
                $chatMessages.append("<li>" + sanitize(username) + ": " + sanitize(text) + "</li>");
                goToBottom();

            }
            return false;
        }
    });

    function playSound(buffer) {
        if (soundOn) {
            var source = context.createBufferSource();
            source.buffer = buffer;
            source.connect(context.destination);
            source.start(0);
        }
    }

});