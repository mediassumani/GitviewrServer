// This controller handles the user Auth and Autorization

const app = require('express')
const router = app.Router()
const User = require('../models/user')
const jwt = require("jsonwebtoken")
const superagent = require("superagent")
const cookieParser = require("cookie-parser")

// Endpoint to get the user's access token with Github SDK
router.get("/user/signin/callback", (request, response) =>{

  const code = request.param('code')
  superagent
    .post('https://github.com/login/oauth/access_token')
    .send({
       client_id: `${process.env.GITHUB_CLIENT_ID}`,
       client_secret: `${process.env.GITHUB_CLIENT_SECRET}`,
       code: `${code}`
     })
    .set('Accept', 'application/json')
    .then(result => {
       let github_token = result.body.access_token
       response.cookie("gvToken", github_token, { maxAge: 900000 })
       if (github_token !== undefined) {
       superagent
         .get('https://api.github.com/user')
         .set('Authorization', 'token ' + github_token)
         .then(result => {
           const user = new User(result.body)
           user.save().then( (savedUser) => {
             response.redirect("https://www.google.com")
           })
           .catch( (error) => {
             console.log(error.message);
             return response.status(400).send({ err: error })
           })
       }).catch( (error) => {
         console.log(error.message);
       })
     }
    }).catch( (error) => {
      console.log(error.message);
    })
})

router.get('/logout', function(request, response){
  // TODO: Clear the cookies
  response.clearCookie('gvToken')
  // TODO: Redirect user to a different page
})
module.exports = router