const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require ('passport-local-mongoose');


const UserSchema = new Schema ({
    email: {
            type: String,
            required: true,
            unique: true
    }
});

//this is going to add the UserSchema to the the passport model that has username and hashed password already

UserSchema.plugin(passportLocalMongoose.default);

module.exports = mongoose.model('User', UserSchema);
