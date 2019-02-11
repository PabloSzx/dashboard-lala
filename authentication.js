const passport = require('passport')
  , CustomStrategy = require('passport-custom').Strategy;

const superagent = require('superagent');

passport.serializeUser(function(user, done) {
  console.log("deserializar");
  done(null, user); //This info is received by the client, just the id
});

passport.deserializeUser(function(user, done) {
  console.log("serializar");
  done(null, user); // This info is established in the server, all the user's data
})

const verifier = (req,done) => {
  console.log("autenticar");
  var user = {
      "id":"1",
      "password":"1",
      "role":"Admin",
      "name":"Administrador",
      "program":{
        "id":"17008",
        "name":"Ingeniería Civil en Informática"
      }
  };
  const sessionID = req.sessionID;

  superagent.get("http://146.83.216.239/auth/current_user")
      .then( res => {
        //req.params.id = JSON.parse(res.text).getAnonymousIdResult;
        //next();
        //console.log(res.text);
        done(null,user);
      })
      .catch( error => {
        done(null,false);
      });


}

passport.use('UACH_AUTH',new CustomStrategy(verifier));

module.exports = passport;
