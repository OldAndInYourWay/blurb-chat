# blurb-chat
Node.js + Express + Socket.IO chat app

![animation](https://cloud.githubusercontent.com/assets/6892666/13548389/4547056e-e2bd-11e5-89bc-901a69326c72.gif)

http://chat.khalilstemmler.com

blurb chat is a quick little chat application that I put together using Express and Socket.IO. 
The upper portion of the **server.js** file is responsible for the lifecycle of the application: what I mean by this is that it stores a chat log for the entire day every day and writes it to a unique file at 11:59pm.

I was initially hosting this at home through my port-forwarded home router on my old Lenovo laptop with broken hinges but moving around every 4 months and taking all my toys with me was getting annoying redeploying it. The application is now hosted on Heroku (which I'm trying for the first time and have been pretty happy with their free plan so far).

All in all, this is a nifty little project that should exemplify how easy it is to use Socket.IO. And really, props to the devs over at Socket.IO for designing a killer cross-platform networking tool.
