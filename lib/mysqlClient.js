'use strict';

class MysqlClient {
    initialize (config) {
        this.knex = require('knex')({client: 'mysql', connection: config, debug: true});
        this.bookshelf = require('bookshelf')(this.knex, { debug: true});
    }
}

module.exports =new MysqlClient();