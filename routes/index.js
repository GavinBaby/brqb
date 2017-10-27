var express = require('express');
var router = express.Router();
var nodeExcel = require('excel-export');
var user = require('../models/table').user;
var login = require('../models/table').login;
var dic = require('../models/table').dic;
var knex = require('../lib/mysqlClient').knex;
var moment = require('moment');
router.get('/', function(req, res, next) {
    var qudao =req.query.qudao||'';
	var name =req.query.name||'佰锐钱包';
    res.render('index', { title: name+'，你的私人钱包' ,qudao:qudao });
});
router.get('/first', function(req, res, next) { 
    var qudao =req.query.qudao||'';
	 var title =req.query.title||'佰锐钱包，你的私人钱包';
	if(req.query.type==1){
		res.render('first-mobile', { title: title  ,qudao:qudao});
	}else{
		res.render('first', { title: title ,qudao:qudao });
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
	    {caption:'手机型号', type:'string', width:'20'},
	    {caption:'录入时间', type:'string', width:'20'},
	    {caption:'性别', type:'string', width:'20'},
	    {caption:'年龄', type:'number', width:'20'},
	    {caption:'备注', type:'string', width:'40'},
	    {caption:'信息来源', type:'string', width:'40'},
	    {caption:'跟踪标识', type:'string', width:'40'},
		{caption:'维护人员', type:'string', width:'40'}
    ];
    var begin =req.query.begin||'1000-01-01';
    var end =req.query.end||'2999-01-01';
    var source =req.query.source||'';
    var user=req.session.user;
    var sql ='select * from user where left(create_time,  10) between "' +begin+'" and "'+ end+'"';
    if(user.role_menu&&user.role_menu.indexOf('查看所有客户')>=0){

    } else if(user.role==2){
        sql=sql+'and belong="'+user.name+'"';
    }
    if(req.query.name){
        sql=sql+'and name="'+req.query.name+'"';
    }
    if(req.query.belong){
        sql=sql+'and belong="'+req.query.belong+'"';
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
			newrow.push(o.mobiletype);
            newrow.push(o.create_time);
            newrow.push(o.sex);
            newrow.push(o.age);
            newrow.push(o.remark);
            newrow.push(o.source);
            newrow.push(o.jd); //进度
			newrow.push(o.belong); //进度
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
    if(user.role_menu&&user.role_menu.indexOf('查看所有客户')>=0){

    } else if(user.role==2){
        sql=sql+'and belong="'+user.name+'"';
    }
    if(cond.name){
        sql=sql+'and name="'+cond.name+'"';
    }
    if(cond.belong){
        sql=sql+'and belong="'+cond.belong+'"';
    }
    if(cond.mobile){
        sql=sql+'and mobile="'+cond.mobile+'"';
    }
    if(cond.jd){
        sql=sql+'and jd="'+cond.jd+'"';
    }
    if(cond.source){
        sql=sql+'and source like "%'+cond.source+'%"';
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
    user.query().update(body).where({id:body.id}).then(function (reply) {
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

router.get('/yhlist',  function(req, res, next) {
    var sql ='select name from login where isdeleted=0 and name!="admin"';
    knex.raw(sql ).then(function (reply) {
        var data=reply[0];
        res.send( data );
    }).catch(function (err) {
        console.log("!"+err.message+"!")
        res.send('0');
    })
});

router.get('/jdlist',  function(req, res, next) {
    var sql ='select value from dic where code="jd"';
    knex.raw(sql ).then(function (reply) {
        var data=reply[0];
        data = data[0].value.split(',');
        res.send( data );
    }).catch(function (err) {
        console.log("!"+err.message+"!")
        res.send('0');
    })
});

router.post('/yhmod',haslogin, function(req, res, next) {
    var body=req.body;
    var sql='';
    if( body.isdeleted==1){
        sql ='update login set isdeleted=1 where  name!="admin" and id='+ body.id ;
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
    login.query().where({name:body.name}).andWhere('isdeleted',0).then(function (reply) {
        if(reply.length>0){
                res.send({errCode:-1,errText:'用户名已存在'});
        }else{
            body.create_time=moment().format('YYYY-MM-DD HH:mm:ss');
            body.role=2;
            body.isdeleted=0;
            body.id=null;
            login.query().insert(body ).then(function (reply) {
                res.send({data:1});
            });
        }
    })  .catch(function (err) {
        console.log("!"+err.message+"!")
        res.send({data:0});
    })
});


router.get('/jd',  function(req, res, next) {
    dic.query().where({id:1}).then(function (reply) {
        res.send({data:reply[0].value});
    }).catch(function (err) {
        console.log("!"+err.message+"!")
        res.send({data:0});
    })
});
router.post('/jdmod',haslogin, function(req, res, next) {
    dic.query().update({value:req.body.jd}).where({id:1}).then(function (reply) {
                res.send({data:1});
    })  .catch(function (err) {
        console.log("!"+err.message+"!")
        res.send({data:0});
    })
});

router.post('/hfuser',haslogin, function(req, res, next) {
    user.query().update({belong:req.body.belong}).whereRaw( 'id in ('+req.body.ids+')' ).then(function (reply) {
        res.send({data:1});
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
