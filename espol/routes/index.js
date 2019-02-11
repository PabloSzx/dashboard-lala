const { check, validationResult, oneOf } = require('express-validator/check');
const { matchedData, sanitize } = require('express-validator/filter');

const express = require('express');
const router = express.Router();
const path = require('path');
const superagent = require('superagent');
const btoa = require('btoa');
const sha1 = require('js-sha1');

let env       = process.env.NODE_ENV || 'development';
let config    = require(__dirname + '/config/config.json').v1[env];

const API =                 config.APIServer;
const ISSUER =              config.oauth2Server;
const TEST_CLIENT_ID =      config.clientId;
const TEST_CLIENT_SECRET =  config.clientSecret;
const DEFAULT_SCOPE =       config.scope;
const ANONYMOUS_ID_SERVER = config.anonymousIdServer;

// If the app has to reject untrust certificates
//process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

const errorsTypes = { INVALID_PARAMETER : 'InvalidParameter',MISSING_PARAMETER : 'MissingParameter'};

const errorFormatter = ({ location, msg, param, value, nestedErrors }) => {
  return {type:msg.type,msg:`${location}[${param}]: ${msg.msg}`};
};

const isAuthenticated = (req,res,next)=>{
  if(req.xhr) { req.isAuthenticated() ? next() : res.status(403).json({ status:403 , error:'ErrorAuthentication' , detail:'You need credentials to access the application'}) }
  else{req.isAuthenticated() ? next() : res.redirect('/login/auth')}
}

const handleParametersErrors = (req,res,next)=>{
  const errors = validationResult(req).formatWith(errorFormatter);
  errors.isEmpty() ? next() : res.status(400).json({status:422,error:errors.array()[0].type,detail:errors.array()[0].msg});
}

const checkAllowedPrograms1 = (req,res,next)=>{
  let allowedPrograms = [req.params.id];
  allowedPrograms.includes(req.params.id) ? next(): res.status(403).json({ status:403 , error:'Forbiden' , detail:'This user is not allowed to access to this program'});
}

const checkAllowedPrograms2 = (req,res,next)=>{
  let allowedPrograms = [req.user.program.id];
  allowedPrograms.includes(req.query.program) ? next(): res.status(403).json({ status:403 , error:'Forbiden' , detail:'This user is not allowed to access to this program'});
}

const getAnonymousId = async(req,res,next) => {
  let anonymousId = sha1(req.params.id.split('-')[0]);

  const URL = `${ANONYMOUS_ID_SERVER}`;

  superagent.post(URL)
      .type('form')
      .send({ clave: anonymousId})
      .then( res => {
        req.params.id = JSON.parse(res.text).getAnonymousIdResult;
        next();
      })
      .catch( error => {
        console.error(error);
        res.status(400).json({status:400,error:'AnonymousServerError',detail:'There was an error in the Anonymous Sever'});
      });
}

const checkForAPItoken = async(req,res,next) => {
  if(req.user.token) return next();
  else{
        try {
          let res = await getAPItoken();//console.log(res.text);
          req.user.token = JSON.parse(res.text);
          return next();
        } catch (error) {console.log(error);
          //console.log(error.response.text);
          res.status(500).json({status:500,error:'OktaServer',detail:'There was a problem with the OKTA Server'});
          throw new Error({status:500,error:'OktaServer',detail:'There was a problem with the OKTA Server'});
        }
  }
}

const getAPItoken = function(){
    return new Promise((resolve,reject) => {
        const URL = `${ISSUER}/v1/token`;
        const token = btoa(`${TEST_CLIENT_ID}:${TEST_CLIENT_SECRET}`);

        superagent.post(URL)
            .set({'authorization': `Basic ${token}`})
            .type('form')
            .send({ grant_type: 'client_credentials', scope: DEFAULT_SCOPE })
            .then( res => {resolve(res);})
            .catch( error => {reject(error);});
    })
}

const sendGetRequest = (ENDPOINT,req,res,next) =>{
    return new Promise((resolve,reject)=>{
      superagent.get(ENDPOINT)
      .set({'authorization': `${req.user.token.token_type} ${req.user.token.access_token}`})
      .then((resp)=>{
        let response = JSON.parse(resp.text);
        res.status(200).json(response);
        resolve();
      })
      .catch((error)=>{
          if(!error.response){
            res.status(503).json({status:503,error:"ServerUnavailable",detail:"The API service is unavailable"});
            resolve();
          }
          else{
            let response = JSON.parse(error.response.text);
            response.errors[0].error === "The access token has expired" ? reject(response):res.status(response.errors[0].status).json(response.errors[0]);
          }
      });
    });
}

const resendRequestWithRenewedToken = (ENDPOINT,req,res,next,request) => {

  delete req.user.token;
  checkForAPItoken(req,res,()=>{})
    .then(()=>{
       console.error("Token renowed");
       request(ENDPOINT,req,res,next).catch((error)=>{
          res.status(500).json({status:500,error:'APItokenRenewed',detail:'There was a problem with the renewed token API '});
       });
    });
}

/* GET home page. */
router.get('/', isAuthenticated,function(req, res, next) {
  res.render('dashboard',{data:{user:{programa:req.user.program}}});
});

router.get('/programs/:id',isAuthenticated,[

    check('year',{type:errorsTypes.MISSING_PARAMETER,msg:'Must be provided'}).exists(),

  ], handleParametersErrors , checkForAPItoken , checkAllowedPrograms1 , function(req,res,next) {

    let ENDPOINT = `${API}/programs/${req.params.id}?year=${req.query.year}`;

    sendGetRequest(ENDPOINT,req,res,next)
      .catch((error)=>{
          // This error is catched here just when the token has expired
          resendRequestWithRenewedToken(ENDPOINT,req,res,next,sendGetRequest);
      });
});

router.get('/students/:id',isAuthenticated,[

    check('program',{type:errorsTypes.MISSING_PARAMETER,msg:'Must be provided'}).exists(),

  ],handleParametersErrors,checkForAPItoken,checkAllowedPrograms2,/*getAnonymousId,*/function(req,res,next){

    let ENDPOINT = `${API}/students/${req.params.id}?program=${req.query.program}`;

    sendGetRequest(ENDPOINT,req,res,next)
      .catch((error)=>{
        // This error is catched here just when the token has expired
        resendRequestWithRenewedToken(ENDPOINT,req,res,next,sendGetRequest);
      });
});

/* Just destroy session*/
router.get('/logout',isAuthenticated,(req,res,next)=>{
  req.session.destroy(function (err) {
    res.redirect('http://146.83.216.239/logout');
  });
});

module.exports = router;
