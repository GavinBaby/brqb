var express = require('express');
var router = express.Router();
var moment = require('moment');
var user = require('../models/table').user;
/* GET users listing. */
// router.get('/', function(req, res, next) {
//   res.send('respond with a resource2');
// });

router.post('/saveUser', function(req, res, next) {
    var body=req.body;
    if(!body.age){
        delete body.age;
    }
    if(!body.jbamount){
        delete body.jbamount;
    }
    if(!body.cardamount){
        delete body.cardamount;
    }
    if(!body.qq){
        delete body.qq;
    }
    body.create_time=moment().format('YYYY-MM-DD HH:mm:ss');
    user.query().where({mobile:body.mobile}).then(function (reply) {
        if(reply.length>0){
            res.send('手机号已存在');
        }else{
            if(body.source=='bairui01'){
                body.source='汇万金';
            }
			body.source=body.source||'网页';
            user.query().insert(body) .then(function (reply) {
                res.send('1');
            }).catch(function (err) {
                console.log("!"+err.message+"!")
                res.send('0');
            })
        }
    }).catch(function (err) {
        console.log("!"+err.message+"!")
        res.send('0');
    })

});

module.exports = router;
