# blurb-chat
Node.js + Express + Socket.IO chat app

http://chat.khalilstemmler.com

This little chat application was the most fun thing ever to build. 
I built this while I was still learning Node.JS and my friends had a lot of fun injecting javascript alerts to the 
screen before I flushed their text (rookie mistake). 

The upper portion of **server.js** is responsible for the life cycle of the program.
Every night, a log of who has connected and who disconnected is logged to a unique text file for the date.

I thought of using some of the newer available tools to send a text message to myself anytime someone joins but I can see my friends exploiting this; perhaps set something like a "cooldown timer" for the frequency of messages being sent to my phone within a period of time.

Anyways, I was initially running this off of a Port Forwarded Linux Server in my home but I'm thinking of finally paying for proper Heroku hosting.
