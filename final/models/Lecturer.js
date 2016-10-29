/**
 * Created by romcohen on 9/28/16.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var LecturerSchema = new Schema({
    id: Number,
    name: String,
    classes: [Number]
});

module.exports = mongoose.model('Lecturer', LecturerSchema);