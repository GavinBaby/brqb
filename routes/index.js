var express = require('express');
var router = express.Router();
var nodeExcel = require('excel-export');
var user = require('../models/table').user;
var login = require('../models/table').login;
var knex = require('../lib/mysqlClient').knex;
var moment = require('moment');
router.get('/', function(req, res, next) {
    res.render('index', { title: '佰锐钱包，你的私人钱包' });
});
router.get('/first', function(req, res, next) {
	console.log(req.query.type+"@@@@@@@@@@@");
	if(req.query.type==1){
		res.render('first-mobile', { title: '佰锐钱包，你的私人钱包' });
	}else{
		res.render('first', { title: '佰锐钱包，你的私人钱包' });
	}
		
});
router.get('/excel', haslogin,function(req, res, next) {
    if(req.query.name=="brqb"){
        res.render('excel', { title: '数据导出' });
    }else{
        console.log('发现攻击者')
        res.render('error', { error: {status:-1,stack:"发现攻击者"},message:"无权限" });

    }

});

router.get('/export', haslogin,function(req, res, next) {
    var conf ={};
    conf.cols = [
        {caption:'名称', type:'string',width:'20' },
        {caption:'手机号', type:'string', width:'20' },
        {caption:'芝麻信用分', type:'number',width:'20' },
        {caption:'QQ', type:'number', width:'20'},
        {caption:'微信号', type:'string', width:'20'},
	    {caption:'录入时间', type:'string', width:'20'},
	    {caption:'性别', type:'string', width:'20'},
	    {caption:'年龄', type:'string', width:'20'},
	    {caption:'备注', type:'string', width:'40'},
	    {caption:'信息来源', type:'string', width:'40'},
	    {caption:'跟踪标识', type:'string', width:'40'}
    ];
    var begin =req.query.begin||'1000-01-01';
    var end =req.query.end||'2999-01-01';
    var source =req.query.source||'';

    var sql ='select * from user where left(create_time,  10) between "' +begin+'" and "'+ end+'"';
    if(req.session.user.role==2){
        sql =sql+' and belong='+ req.session.user.id;
    }
    if(source){
        sql=sql+' and source='+source;
    }
    knex.raw(sql ).then(function (reply) {
        reply= reply[0];
        conf.rows = [];
        var o;
        for(var i=0;i<reply.length;i++){
            o=reply[i];
            var newrow=[];
            newrow.push(o.name);
            newrow.push(o.mobile);
            
            newrow.push(o.zmnum);
            
            newrow.push(o.qq);
            newrow.push(o.wx);
            newrow.push(o.create_time);
            newrow.push(o.sex);
            newrow.push(o.age);
            newrow.push(o.remark);
            newrow.push(o.source);
            newrow.push(o.jd); //进度
            conf.rows.push(newrow);
        }
        var result = nodeExcel.execute(conf);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats');
        res.setHeader("Content-Disposition", "attachment; filename=" + "khzl.xlsx");
        res.end(result, 'binary');
    }).catch(function (err) {
        console.log("!"+err.message+"!")
        res.send('0');
    })

});



router.get('/kh',haslogin, function(req, res, next) {
    var user =req.session.user;

    var cond=req.query;
    var begin =req.query.begin||'1000-01-01';
    var end =req.query.end||'2999-01-01';
    var sql ='select * from user where left(create_time,  10) between "' +begin+'" and "'+ end+'" ';
    if(user.role==2){
        sql=sql+'and belong="'+user.id+'"';
    }
    if(cond.name){
        sql=sql+'and name="'+cond.name+'"';
    }
    if(cond.mobile){
        sql=sql+'and mobile="'+cond.mobile+'"';
    }
    if(cond.jd){
        sql=sql+'and jd="'+cond.jd+'"';
    }

    knex.raw(sql ).then(function (reply) {
        // res.send({data:reply,totalsize:reply.length});
        var data=reply[0];
        var len =reply[0].length;
        if(req.query.page ){
            data=reply[0].splice((req.query.page-1)*req.query.rows, req.query.rows);
        }
        res.send({rows:data,total:len});
    }).catch(function (err) {
        console.log("!"+err.message+"!")
        res.send('0');
    })

});


router.post('/kh',haslogin, function(req, res, next) {
    var body=req.body;
    var sql='';
    var cond='';
    user.query().update(body).where(id,body.id ).then(function (reply) {
        res.send({data:1});
    }).catch(function (err) {
        console.log("!"+err.message+"!")
        res.send({data:0});
    })
});

router.get('/yh',haslogin, function(req, res, next) {
    var cond=req.query;
    var sql ='select * from login where isdeleted=0 ';
    knex.raw(sql ).then(function (reply) {
        // res.send({data:reply,totalsize:reply.length});
        var data=reply[0];
        var len =reply[0].length;
        if(req.query.page ){
            data=reply[0].splice((req.query.page-1)*req.query.rows, req.query.rows);
        }
        res.send({rows:data,total:len});
    }).catch(function (err) {
        console.log("!"+err.message+"!")
        res.send('0');
    })
});

router.post('/yhmod',haslogin, function(req, res, next) {
    var body=req.body;
    var sql='';
    if( body.isdeleted==1){
        sql ='update login set isdeleted=1 where id='+ body.id ;
    }else{
        var cond='';
        if(body.pswd){
            cond=',pswd="'+body.pswd+'" ';
        }
        body.role_menu=body.role_menu||'';
        sql ='update login set role_menu="'+ body.role_menu+'"'+cond+'  where id='+ body.id ;
    }
    knex.raw(sql ).then(function (reply) {
        // res.send({data:reply,totalsize:reply.length});
        res.send({data:1});
    }).catch(function (err) {
        console.log("!"+err.message+"!")
        res.send({data:0});
    })
});

router.post('/yhadd',haslogin, function(req, res, next) {
    var body=req.body;
    login.query().where({name:body.name}).then(function (reply) {
        if(reply.length>0){
                res.send({errCode:-1,errText:'用户名已存在'});
        }else{
            body.create_time=moment().format('YYYY-MM-DD HH:mm:ss');
            body.role=2;
            body.isdeleted=0;
            login.query().insert(body ).then(function (reply) {
                res.send({data:1});
            });
        }
    })  .catch(function (err) {
        console.log("!"+err.message+"!")
        res.send({data:0});
    })
});
function haslogin(req, res, next) {
    if (req.session&&req.session.user) {
        return next();
    } else {
            res.redirect('/login');
    }
};
module.exports = router;
