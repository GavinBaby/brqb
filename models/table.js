var bookshelf = require('../lib/mysqlClient').bookshelf;

var table = {};
table.user = bookshelf.Model.extend({
    tableName: 'user'
});

table.login = bookshelf.Model.extend({
    tableName: 'login'
});

module.exports = table;
