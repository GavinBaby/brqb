var bookshelf = require('../lib/mysqlClient').bookshelf;

var table = {};
table.user = bookshelf.Model.extend({
    tableName: 'user'
});
module.exports = table;
