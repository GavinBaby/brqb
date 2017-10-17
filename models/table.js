var bookshelf = require('../lib/mysqlClient').bookshelf;

var table = {};
table.user = bookshelf.Model.extend({
    tableName: 'user'
});

table.login = bookshelf.Model.extend({
    tableName: 'login'
});

table.dic = bookshelf.Model.extend({
    tableName: 'dic'
});

module.exports = table;
