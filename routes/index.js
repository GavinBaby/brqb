var express = require('express');
var router = express.Router();
var nodeExcel = require('excel-export');
var user = require('../models/table').user;
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: '资料填写' });
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
        {caption:'手机号', type:'string', width:'30' },
        {caption:'年龄', type:'int'},
        {caption:'工作单位', type:'string', width:'100' },
        {caption:'职务', type:'string'},
        {caption:'单位电话', type:'string'},
        {caption:'芝麻信用分', type:'int'},
        {caption:'借呗额度', type:'int'},
        {caption:'信用卡额度', type:'int'},
        {caption:'QQ', type:'int'},
	{caption:'录入时间', type:'string'}
    ];

    user.query().then(function (reply) {
        conf.rows = [];
        var o;
        for(var i=0;i<reply.length;i++){
            o=reply[i];
            var newrow=[];
            newrow.push(o.name);
            newrow.push(o.mobile);
            newrow.push(o.age);
            newrow.push(o.work);
            newrow.push(o.position);
            newrow.push(o.workmobile);
            newrow.push(o.zmnum);
            newrow.push(o.jbamount);
            newrow.push(o.cardamount);
            newrow.push(o.qq);
            newrow.push(o.create_time);
            conf.rows.push(newrow);
        }
	console.log(conf.rows)
        var result = nodeExcel.execute(conf);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats');
        res.setHeader("Content-Disposition", "attachment; filename=" + "Report.xlsx");
        res.end(result, 'binary');
    }).catch(function (err) {
        console.log("!"+err.message+"!")
        res.send('0');
    })

});

module.exports = router;
