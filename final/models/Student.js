var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var StudentSchema = new Schema({
    id: Number,
    classes: [{classId: Number, name: String, attendance: Number}],
    MAC: String
});

module.exports = mongoose.model('Student', StudentSchema);