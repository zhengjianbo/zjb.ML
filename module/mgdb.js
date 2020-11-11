var config = require('../config');
var mongoose = require('mongodb');
mgdb = function () {
    this.MongoClient = mongoose.MongoClient;
    this.DB_CONN_STR = config.DB_CONN_STR;
    this.DBName = config.DBName;
    this.db = null;
}
mgdb.prototype = {
    connect: function (conncallback) {
        this.MongoClient.connect(this.DB_CONN_STR, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }, function (err, db) {
            mdb.db = db.db(mdb.DBName);
            if (conncallback) {
                conncallback(err, db);
            }
        });
    },
    Find: async function (table, para) {
        if (para.where && para.where._id) {
            para.where._id = mongoose.ObjectId(para.where._id);
        }
        let collection = await this.db.collection(table);
        //limit: rws, skip: skp, sort: para.sort
        let data = await collection.find(para.where, para.para).toArray();
        let count = await collection.find(para.where).count();
        let jsonArray = { rows: data, total: count };
        return jsonArray;
    }


}
const mdb = new mgdb();

exports.mdb = mdb;