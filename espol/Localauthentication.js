var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;
var fs = require('fs');

var users = {};
try {
    var data = fs.readFileSync('users/users.json', 'utf8');
    users = JSON.parse(data);
} catch(e) {
  throw e;
}

passport.serializeUser(function(user, done) {
  done(null, user.id); //This info is received by the client, just the id
});

passport.deserializeUser(function(id, done) {
  var user;
  Object.keys(users).forEach(function(key) {
    if(users[key].id === id)
      user = users[key];
  });
  done(null, user); // This info is established in the server, all the user's data
})

passport.use(new LocalStrategy(
  function(username, password, done) {
    if(users[username]){
      if(users[username].password === password)
        return done(null, users[username]);
      else
        return done(null, false, { message: 'Incorrect password.' });
    }else{
      return done(null, false, { message: 'Incorrect username.' });
    }
  }
));

module.exports = passport;
