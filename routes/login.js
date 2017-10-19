var express = require('express');
var router = express.Router();
var moment = require('moment');
var login = require('../models/table').login;
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
router.get('/main',haslogin, function (req, res) {
    var role=req.session.user.role;

    res.render('main',{role:role});
});

router.get('/exit', function (req, res) {
    req.session = null;
    res.render('login' );
});



router.get('/fun', function (req, res) {
    var canExport;
    var user=req.session.user;
    if(user.role_menu&&user.role_menu.indexOf('导出')>=0){
        canExport=1
    }else{
        canExport=0;
    }
    res.send( {canExport:canExport});
});


function haslogin(req, res, next) {
    if (req.session&&req.session.user) {
        return next();
    } else {
        res.redirect('/login');
    }
};
module.exports = router;
