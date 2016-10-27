/**
 * Created by romcohen on 10/26/16.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var UsersSchema = new Schema({
    username: Number,
    password: String,
    userRole: String
});

UsersSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UsersSchema);