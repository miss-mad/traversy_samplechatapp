// traversy media socket.io chat app with rooms example

// socket.io allows the connection persist between the client and server
// socket.io are websockets that connect to the server and those connections stay open; useful when making lots of small requests bc you can constantly talk with the server without worrying about the headache of setting up or tearing down a connection
// chat apps are ideal for websockets
// admin.socket.io dashboard to manage sockets
// by default socket.io will store all messages that you send upon disconnecting and once reconnected, will send them all at once (use socket.volatile.emit to prevent this; if I can't send the message, then forget about it completely)
// socket.io is a library that enables runtime bidirectional and event-based communication between the browser and the server using nodejs and js for the browser
// bidirectional = 2+ parties take part in the conversation
// every action is considered an event
// to send a message, you emit an event with the message data
// the client will try to establish a web (or websocket) connection
// a websocket is a communication protocol which provides a full duplex and load ? channel between the server and the browser

// entry point/start to everything

// require express npm package
const express = require("express");
// use/initialize express
const app = express();

// require the http package which is used by express under the hood but we want to access the method createServer directly in order to use socket.io
// call the http module to create communication between client and server
const http = require("http");
// supply the express app to the HTTP server
// give the createServer method our express app
// binding the app with the http request
// createServer = Server?
const server = http.createServer(app);
// ALT const server = require("http").createServer(app)

// require socket.io
const socketio = require("socket.io");
// pass socket.io our server
// usually the initial value = io and the socket = socket
// then attach the http server to the socket.io
const io = socketio(server);
// ALT const io = require("socket.io")(server, {cors: {origin: "*"}}) // cors part is optional

// additional tools
// node js core module to combine/translate different OS' path slashes
const path = require("path");
// require formatMessage function from messages.js helper
const formatMessage = require("./utils/messages");
// username
const botName = "ChatCord Bot";

// unknown/unused tools
const createAdapter = require("@socket.io/redis-adapter").createAdapter;
const redis = require("redis");
// for our database environment variables
require("dotenv").config();
const { createClient } = redis;
const { copyFileSync } = require("fs");

// heroku port variable + default local variable
const PORT = process.env.PORT || 3000;

// require user functions from users.js helper
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require("./utils/users");

// _______________________________
// pedrotech
// create a home route to incorporate handlebars:
// so app knows we're using ejs as the template engine
// app.set("view engine", "ejs");

// renders the homepage html
// define a route handler that gets called when we hit our website home
// (req, res) is the callback function
// app.get("/home", (req, res) => {
//   res.render("home");
//  OR res.sendFile(path.join(__dirname, "src/index.html")); // returns index.html as the response
// });
// _______________________________

// _______________________________
// WDS
// creating a custom namespace
// separate io instance - creating a user namespace
// const userIo = io.of("/user");
// userIo.on("connection", (socket) => {
//   console.log("connected to user namespace");
// });

// connecting middleware to namespace
// can connect middleware to anything such as the base io but it's useful to connecting authentication middleware
// 2 parameters: socket = all information from the socket we're connecting with; next = the next middleware
// userIo.use((socket, next) => {
//   if (socket.handshake.auth.token) {
//     socket.username = getUsernameFromToken(socket.handshake.auth.token);
//     next();
//   } else {
//     next(new Error("Please send token"));
//   }
// });
// _______________________________

// Set public folder as the static folder using path
app.use(express.static(path.join(__dirname, "public")));

// _______________________________
// ADDITIONAL TRAVERSY
// (async () => {
//   pubClient = createClient({ url: "redis://127.0.0.1:6379" });
//   await pubClient.connect();
//   subClient = pubClient.duplicate();
//   io.adapter(createAdapter(pubClient, subClient));
// })();

// Run when client connects to chat app
// take io object and the .on listens for an event, which is a connection (when a client connects to the chat app)
// function runs everytime the client connects to the server and gives a socket instance for each one of them (socket)
// socket.id is a random id assigned to the client

// _______________________________
// WDS
// all it takes to set up the server side is:
// io.on("connection", socket => {
// console.log(socket.id)
//})
// _______________________________

// event emitter - to set event for a person actually connecting to the server
// grab the socket variable from the connection to create events/pipelines for sending data
// each socket has a unique id; a socket = a person almost, it's a connection; each connection to our project has a different id
// connection is an event
// this connection starts the socket.io server; connects a person to the server
// need to do all of our logic in this io.on("connection") bc this is where everything happens
// we only want to emit and receive events if a person is actually connected to the socket.io server
// inside of here (below) is the only place we have access to the socket variable which is the variable we use to emit or send or receive data
// create a new connection
// when we want to connect two people, we need to make a new, unique connection
// we're on the server side. I want to send a message to the client (front end)
// io = instance of the socket.io
// on() method takes event as first parameter, event listener as a second parameter
// return a callback function
// this creates a new connection from the server side
io.on("connection", (socket) => {
  // socket.io is actually connecting and logs this message
  // console.log("New WS Connection...");
  // console.log(socket) // doesn't give anything because we're listening to the app: change to server.listen and it will log an object
  // console.log("User connected", socket.id) // just want the socket's id which gives a unique random jumble 20-character identifier
  // server & client unique 20-character ids match
  console.log(io.of("/").adapter);
  // have a room functionality
  // use socket variable
  // on() method says that we want to receive this event
  // this event is called "joinRoom"
  // when user joins a room, grab the username and the room name to pass this info to the front end
  // wait for someone to emit to this event "joinRoom", then grab the data
  // the socket.emits (2) from main.js front end and receives it here in server.js on the back end. then we emit that message on line 145
  socket.on("joinRoom", ({ username, room }) => {
    // console.log(username, room);
    // need to join a room; id comes from socket on line 54
    const user = userJoin(socket.id, username, room);

    // Join the room
    socket.join(user.room);

    // Welcome current user
    // send (or emit) messages back and forth - bidirectional conversation/open door between client and server
    // can emit whatever you want; "message" can be whatever you want, send whatever data or message you want
    // formatMessage() is in messages.js helper
    // emit() method says that we want to broadcast/send this event
    // I emitted this message to the server, and I want the server to broadbast this message I received to everyone on the server
    socket.emit("message", formatMessage(botName, "Welcome to ChatCord!"));

    // Broadcast when a user connects
    // broadcast emits to everyone except the user that's connecting (bc don't need to notify that person connecting that they're connecting)

    //_______________________________________
    // THREE WAYS TO BROADCAST:
    // socket.emit = to a single client (probably yourself); basic emit
    // socket.broadcast.emit = to all clients except sender
    // io.emit = general broadcast to all connected

    // In order to send an event to everyone, Socket.IO gives us the io.emit() method
    // io.emit('some event', { someProperty: 'some value', otherProperty: 'other value' }); // This will emit the event to all connected sockets
    // If you want to send a message to everyone except for a certain emitting socket, we have the broadcast flag for emitting from that socket
    // io.on('connection', (socket) => { socket.broadcast.emit('hi');});
    //_______________________________________

    socket.broadcast
      // Broadcast to the specific room
      .to(user.room)
      .emit(
        "message",
        formatMessage(botName, `${user.username} has joined the chat`)
      );

    // Send users and room info
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  // Listen for chatMessage
  // use socket variable
  // on() method says that we want to receive this event
  // this event is called "chatMessage"
  // when user receives a message, grab the message data to pass this info to the front end
  // wait for someone to emit to this event "chatMessage", then grab the data
  socket.on("chatMessage", (msg) => {
    // console.log(msg);
    const user = getCurrentUser(socket.id);

    // emit to everyone (io.emit); emit as message and send the message
    // user template engine handlebars to show this on the user side
    // broadcast to the specific room, otherwise this message goes to every room
    // this gives us the name on the chat message once sent
    io.to(user.room).emit("message", formatMessage(user.username, msg));
  });

  // Runs when client disconnects
  // strange that disconnect is inside the connection, but you want this here, you don't want it outside of connection
  // use socket variable
  // on() method says that we want to receive this event
  // this event is called "disconnect"
  // when user disconnects, there is no data to grab to pass to the front end this time
  // wait for someone to emit to this event "disconnect"
  socket.on("disconnect", () => {
    // console.log("A user disconnected");
    // emit to everyone that the user has left the chat
    // io.emit("message", "A user has left the chat")
    // know which user left by their id
    const user = userLeave(socket.id);

    // check for the user and if that user exists, broadcast to the specific room that the user left
    if (user) {
      io.to(user.room).emit(
        "message",
        formatMessage(botName, `${user.username} has left the chat`)
      );

      // Send users and room info upon disconnect so that the user is removed from the sidebar
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });
});

// app.listen(PORT, () => console.log(`Server running on port ${PORT}));
// the createServer method is why we have server.listen and not app.listen
// listen to the server, not the app
server.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
