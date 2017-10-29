var express = require('express');
var router = express.Router();
var moment = require('moment');
var user = require('../models/table').user;
var formidable = require('formidable');
var xlsx = require('node-xlsx');
var fs = require('fs');
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




router.get('/', function(req, res, next) {
    res.writeHead(200, {'content-type': 'text/html'});
    res.end(
        '<form action="/users/upload" enctype="multipart/form-data" method="post">'+
        '<input type="text" name="title"><br>'+
        '<input type="file" name="upload" multiple="multiple"><br>'+
        '<input type="submit" value="Upload">'+
        '</form>'
    );
});

router.post('/upload', function(req, res, next) {
    console.log(" ########## POST /upload ####### ");
    var fileTypeError = false;
    var target_path =  "../upload";
    var form = new formidable.IncomingForm();
    form.encoding = 'utf-8';
    form.keepExtensions = true;
    form.maxFieldsSize = 10 * 1024 * 1024;
    form.uploadDir = target_path;

    var fields = [];
    var files = [];

    // form.on('field', function (field, value) {
    //           fields.push([field, value]);
    // });
    form.on('file', function (field, file) {
        console.log('upload file: ' + file.name);
        //判断文件类型是否是xlsx
        if (file.type != 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
            fileTypeError = true;
        }
        files.push([field, file]);
    });

    form.on('end', function () {

        //遍历上传文件
        var fileName = '';
        var obj = '';
        var folder_exists = fs.existsSync(target_path);
        if (folder_exists) {
            var dirList = fs.readdirSync(target_path);
            dirList.forEach(function (item) {
                if (!fs.statSync(target_path + '/' + item).isDirectory()) {
                    console.log('parse item:' + target_path + '/' + item);
                    fileName = target_path + '/' + item;
                    if (!fileTypeError) {
                        //解析excel
                        obj = xlsx.parse(fileName);
                        console.log(JSON.stringify(obj));
                        //insert into DB
                        var users = [];
                        var o;
                        for(var i=1;i<obj[0].data.length;i++){
                            var temp ={};
                            var temp2 =  obj[0].data[i];
                            temp.name= temp2[0];
                            temp.mobile= temp2[1];
                            temp.zmnum= temp2[2];
                            temp.qq= temp2[3];
                            temp.wx= temp2[4];
                            temp.mobiletype= temp2[5];
                            temp.create_time= temp2[6];
                            temp.sex= temp2[7];
                            temp.age= temp2[8];
                            temp.remark= temp2[9];
                            temp.source= temp2[10];
                            temp.jd= temp2[11];
                            temp.belong= temp2[12];
                            users.push(temp);
                        }
                        user.query().insert(users).then(function (reply) {
                            res.send({"rtnCode": "0", "rtnInfo": "成功导入数据"});
                        }).catch(function (err) {
                            console.log("!"+err.message+"!")
                            res.send('0');
                        })
                    } else {
                        res.send({"rtnCode": "1", "rtnInfo": "文件格式不正确"});
                    }
                    //delete file
                    fs.unlinkSync(fileName);

                }
            });
        }else{
            res.send({"rtnCode": "1", "rtnInfo": "系统错误"});
        }

    });
    form.on('error', function(err) {
        res.send({"rtnCode": "1", "rtnInfo": "上传出错"});
    });
    form.on('aborted', function() {
        res.send({"rtnCode": "1", "rtnInfo": "放弃上传"});
    });
    form.parse(req);

});

module.exports = router;
