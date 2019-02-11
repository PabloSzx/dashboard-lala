var express = require('express');
var router = express.Router();

const request = require('request').defaults({ followRedirect : false, encoding : null });
module.exports = function(passport){

  // req.isAuthenticated implemented by passport module
  const isAuthenticated = (req,res,next)=>{ req.isAuthenticated() ? res.redirect('/') : next();}

  /*router.get('/',isAuthenticated,function(req,res,next){
    res.render('login', { title: 'Login', messages: req.flash('error')});
  });

  router.post('/',
    passport.authenticate('local', { successRedirect: '/',failureRedirect: '/login',failureFlash: true })
  );*/

  router.get('/auth',isAuthenticated,function(req,res){
    //console.log("SESSION",req.sessionID);
    res.redirect(`http://146.83.216.239/auth?callback=http://200.126.23.221:3001/login/auth/return&&sessionID=${req.sessionID}`)
  });

  router.get('/auth/return',isAuthenticated,passport.authenticate('UACH_AUTH',{successRedirect: '/',failureRedirect: '/login/auth/error'}));

  router.get('/auth/error',function(req,res){
    res.send("Ocurrió un Error en el proceso de autenticación");
  });
  return router;
}
