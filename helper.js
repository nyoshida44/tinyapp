const bcrypt = require('bcryptjs');

const functionGenerator = () => {
  // function to generate 6 digit random alphanumerical ShortURL
  const generateRandomString = () => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const length = 6;
    let randomString = "";

    for (let i = 0; i < length; i++) {
      const randomNumber = Math.floor(Math.random() * characters.length);
      randomString += characters[randomNumber];
    }
    return randomString;
  };

  // registerCatcher is used to check if registration is valid
  const registerCatcher = (userList, email, password) => {
    for (const user in userList) {
      if (email === userList[user]["email"]) {
        return {error: "Email Taken"};
      } if (password === "" || email === "") {
        return {error: "Email or Password empty"};
      }
    }
    return {error: null};
  };

  // loginCatcher is used to check if the login information sent by client is correct
  const loginCatcher = (userList, email, password) => {
    for (const user in userList) {
      if (email === userList[user]["email"]) {
        if (bcrypt.compareSync(password, userList[user]["password"])) {
          return {error: null, data: userList[user]["id"]};
        }
        return {error: "Password is incorrect", data: null};
      }
    }
    return {error: "Email not registered in database", data: null};
  };

  // function to grab LongURLs and URL id that match login id
  const urlsForUser = (loginID, database) => {
    const returnObject = {};
    for (const data in database) {
      if (database[data]["userID"] === loginID) {
        returnObject[data] = database[data]["longURL"];
      }
    }
    return returnObject;
  };

  return {
    generateRandomString,
    registerCatcher,
    loginCatcher,
    urlsForUser
  };
};

module.exports = functionGenerator;