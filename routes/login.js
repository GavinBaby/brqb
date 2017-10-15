var express = require('express');
var router = express.Router();
var moment = require('moment');
var login = require('../models/table').login;
var session={};
/* GET users listing. */
// router.get('/', function(req, res, next) {
//   res.send('respond with a resource2');
// });
router.get('/', function (req, res) {
        res.render('login' );
});
router.post('/', function (req, res) {
    login.query().where(req.body).then(function (reply) {
        if(reply.length==1){
            session[reply[0].name]=reply[0];
            req.session.user=reply[0];
            res.send( {role:reply[0].role});
        }else{
            res.send( {role:''});
        }
    }).catch(function (err) {
        console.log("!"+err.message+"!")
        res.send('0');
    })
});
router.get('/main', function (req, res) {
    var role=req.query.role;
    res.render('main',{role:role});
});

router.get('/exit', function (req, res) {
    var role=1;

    res.render('login',{role:role});
});

module.exports = router;
