// anything to do with users goes here
// could connect database/model instead of keeping in memory

const users = [];

// Join user to chat
function userJoin(id, username, room) {
  const user = { id, username, room };

  // take users array and push onto that array the newly joined user
  users.push(user);

  return user;
}

// Get current user
function getCurrentUser(id) {
  return users.find(user => user.id === id);
}

// User leaves chat
function userLeave(id) {
  const index = users.findIndex(user => user.id === id);

  // if the index is not equal to -1, then return the users array without the user that just left with splice
  if (index !== -1) {
    // 0 index because we don't want to return the entire array, just the user
    return users.splice(index, 1)[0];
  }
}

// Get room users
function getRoomUsers(room) {
  return users.filter(user => user.room === room);
}

module.exports = {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers
};
