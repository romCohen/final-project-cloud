var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var StudentSchema = new Schema({
    id: Number,
    classes: [{classId: Number, attendance: Number}],
    MAC: String
});

module.exports = mongoose.model('Student', StudentSchema);