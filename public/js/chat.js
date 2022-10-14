// frontend js file

// attribute selectors with vanilla js to select/access certain html elements
// access the form
const chatForm = document.getElementById("chat-form");
// access chat messages
const chatMessages = document.querySelector(".chat-messages");
// access room name
const roomName = document.getElementById("room-name");
// access user list
const userList = document.getElementById("users");

// get username and room from URL with object destructuring
const { username, room } = Qs.parse(location.search, {
  // ignores the & and other symbols in the URL
  ignoreQueryPrefix: true,
});
// console.log(username, room);

// we have access to io because of the script tag we added in chat.html (<script src="/socket.io/socket.io.js"></script>)
const socket = io();

// Join chatroom
// "joinRoom" = pass the name of the connection we want to emit it to
// username, room = then pass data
// emit this message on the front end
socket.emit("joinRoom", { username, room });

// Get room and users
socket.on("roomUsers", ({ room, users }) => {
  // a couple more DOM related functions here
  outputRoomName(room);
  outputUsers(users);
});

// Message from server
// check to see if we actually received the message, if someone received the broadcast
// then show this message with the outputMessage() function
// whenever we get this message event, we get a function with a message parameter
// catches all the messages emitted in server.js and logs them in console
socket.on("message", (message) => {
  console.log(message);
  // message from server
  outputMessage(message);

  // Scroll down automatically
  // every time we get a message, we want to auto scroll down to the botto
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Message submit
// create event listener for the submission of the chat form
chatForm.addEventListener("submit", (event) => {
  event.preventDefault();

  // Get message text input
  // msg = the id of the chat-form in the chat.html
  // when we submit the form, should get the message from the text input and log it on the client side
  const message = event.target.elements.msg.value;
  // trim any extra spaces
  msg = message.trim();
  // console.log(message);

  // catch for if there are no messages
  if (!msg) {
    return false;
  }

  // Emit chat message to server; the message is the payload
  // "chatMessage" = pass the name of the connection we want to emit it to
  // msg = then pass data
  // emit this message on the front end
  socket.emit("chatMessage", message);

  // Clear input
  event.target.elements.msg.value = "";
  event.target.elements.msg.focus();
});

// Output message to DOM so we can see it
function outputMessage(message) {
  // DOM manipulation
  // create a <div> element
  // referencing lines 35-36 of chat.html
  const div = document.createElement("div");
  // add "message" as a class on the <div> just created
  // adds message class on line 36
  div.classList.add("message");
  // create a <p> element
  const p = document.createElement("p");
  // add "meta" as a class on the <p> just created
  p.classList.add("meta");
  // place the user's username as the text inside the <p> just created
  // innerText returns all text contained by an element and all its child elements. innerHtml returns all text, including html tags, that is contained by an element.
  p.innerText = message.username;
  // place the user's message's timestamp inside a <span>
  p.innerHTML += `<span>${message.time}</span>`;

  // alternative to lines 90-97 above
  /*
  // pasted lines 37-41 in chat.html into backticks; replaces text with message
  div.innerHTML = `<p class="meta">${message.username} <span>${message.time}9:12pm</span></p>
    <p class="text">
      ${message.text}
    </p>`;
  */

  // make the newly created <p> element a child of the newly created <div>
  div.appendChild(p);
  // create a <p> element
  const para = document.createElement("p");
  // add "text" as a class on the <p> just created
  para.classList.add("text");
  // place the user's message as the text inside the <p> just created
  para.innerText = message.text;
  // make the second newly created <p> element a child of the earlier created <div>
  div.appendChild(para);
  // append the div (now a group) to the existing <div> with class ".chat-messages" with attribute selector
  // whenever we create a message, it should add a new div to the chat messages
  document.querySelector(".chat-messages").appendChild(div);
}

// Add room name to DOM
function outputRoomName(room) {
  roomName.innerText = room;
}

// Add users to DOM
// little more tricky because users is stored in an array
function outputUsers(users) {
  userList.innerHTML = "";
  users.forEach((user) => {
    const li = document.createElement("li");
    li.innerText = user.username;
    userList.appendChild(li);
  });
}

// alternate to lines 130-137 above
/*
function outputUsers(users) {
  userList.innerHTML = `${users
    // turning an array into a string
    .map((user) => `<li>${user.username}</li>`)
    .join("")}`;
}
*/

//Prompt the user before leave chat room
// listen for the click on the button with id of "#leave-btn"
// document.getElementById("leave-btn").addEventListener("click", () => {
//   // confirm user wants to leave room with pop up confirm message
//   const leaveRoom = confirm("Are you sure you want to leave the chatroom?");
//   // if affirmative, replace the route with index.html
//   if (leaveRoom) {
//     window.location = "../index.html";
//   } else {
//   }
// });
