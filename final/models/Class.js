/**
 * Created by romcohen on 9/29/16.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ClassSchema = new Schema({
    id: Number,
    Students: [Number],
    LecturerId : Number,
    roomID : String,
    schedule : [{day : String, start : Number, end : Number}],
    numberOfClasses : Number
});

module.exports = mongoose.model('Class', ClassSchema);