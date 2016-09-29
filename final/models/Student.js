var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var StudentSchema = new Schema({
    id: Number,
    classes: [{classId: Number, attendance: Number}]
});

module.exports = mongoose.model('Student', StudentSchema);