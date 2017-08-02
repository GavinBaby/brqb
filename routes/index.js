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
        {caption:'1', type:'string'},
        {caption:'2', type:'string', width:'20' },
        {caption:'3', type:'int'},
        {caption:'4', type:'string', width:'45' },
        {caption:'5', type:'string'},
        {caption:'6', type:'string', width:'20'},
   //     {caption:'7', type:'int'},
    //    {caption:'8', type:'int'},
        {caption:'9', type:'int'},
        {caption:'QQ', type:'int', width:'20'},
	{caption:'11', type:'string', width:'20'}
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
       //     newrow.push(o.zmnum);
      //      newrow.push(o.jbamount);
            newrow.push(o.cardamount);
            newrow.push(o.qq);
            newrow.push(o.create_time);
            conf.rows.push(newrow);
        }
	console.log(conf.rows)
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
