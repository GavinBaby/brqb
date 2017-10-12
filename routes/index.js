var express = require('express');
var router = express.Router();
var nodeExcel = require('excel-export');
var user = require('../models/table').user;
var knex = require('../lib/mysqlClient').knex;
/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: '佰锐钱包，你的私人钱包' });
});
router.get('/first', function(req, res, next) {
  res.render('first', { title: '佰锐钱包，你的私人钱包' });
});
router.get('/excel', function(req, res, next) {
    if(req.query.name=="brqb"){
        res.render('excel', { title: '数据导出' });
    }else{
        console.log('发现攻击者')
        res.render('error', { error: {status:-1,stack:"发现攻击者"},message:"无权限" });

    }

});

router.get('/export', function(req, res, next) {
    var conf ={};
    conf.cols = [
        {caption:'名称', type:'string'},
        {caption:'手机号', type:'string', width:'20' },
         
        {caption:'芝麻信用分', type:'number'},
        
        {caption:'QQ', type:'number', width:'20'},
        {caption:'微信号', type:'string', width:'20'},
	    {caption:'录入时间', type:'string', width:'20'}
    ];
    var begin =req.query.begin||'1000-01-01';
    var end =req.query.end||'2999-01-01';
    knex.raw('select * from user where left(create_time,  10) between "' +begin+'" and "'+ end+'"' ).then(function (reply) {
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

module.exports = router;
