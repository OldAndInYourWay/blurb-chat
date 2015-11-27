$(function () {
    var socket = io('http://localhost:3000/');
    var $usernameForm = $('#username-form');
    var $numberOfUsersDisplay = $('#chat-info');
    var $chatMessages = $('.messages');
    var username = "";
    var $invalid =  $('#invalid');

    $usernameForm.focus();
    
    //Enter Username
    $("#login-form").keypress(function (event) {
        $invalid.css("visibility", "hidden");
        if (event.which == 13) {
            event.preventDefault();
            username = $("#username-form").val();
            username = username.replace(/</g, "&lt;").replace(/>/g, "&gt;");

            //If Blank Username
            if (username === ""){
                $invalid.html("Enter a valid username");
                $invalid.css("visibility", "visible");

            //If Username not blank, ask if OK
            } else {
               socket.emit('username', $("#username-form").val());
            }
            return false;
        }
    });
    
    function sanitize(input){
        return $('<div/>').text(input).text();   
    }
    
    var goToBottom = function(){
        var objDiv = document.getElementById("chat-body");
        objDiv.scrollTop = objDiv.scrollHeight;
    };

    socket.on('confirm username', function(data){
        if(data.confirm === true){
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
    socket.on('numUsers', function(data){
        $numberOfUsersDisplay.html("THERE ARE CURRENTLY " + data.numUsers + " IN THE CHAT");
    });
    
    //Handle when a new user joins. The number of users changes too.
    socket.on('new user joined', function(data){
        $numberOfUsersDisplay.html("THERE ARE CURRENTLY " + data.numUsers + " IN THE CHAT");
        $chatMessages.append("<li>" +sanitize(data.username) + " joined the chat!</li>");
        goToBottom();
    });
    
    socket.on('update user count', function(data){
        $numberOfUsersDisplay.html("THERE ARE CURRENTLY " + data.numUsers + " IN THE CHAT");
    });
    
    socket.on('user left', function(data) {
        $numberOfUsersDisplay.html("THERE ARE CURRENTLY " + data.numUsers + " IN THE CHAT");
        $chatMessages.append("<li>" + sanitize(data.username) + " left the chat.</li>");
        goToBottom();
    });
    
    socket.on('message', function(data){
        var message = data.message;
        var user = data.username;
        $chatMessages.append("<li>" + sanitize(data.username) + ": " + message + "</li>");
        goToBottom();
    });
    
    $("#chatbox").keypress(function (event) {
        if (event.which == 13) {
            event.preventDefault();
            var text = $("#chatbox").val();
            
            if(text !== ""){

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

});