const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');

var userSchema = new Schema({
    "userName": {
        "type":String,
        "unique":true
    },
    "password":String,
    "email":String,
    "loginHistory":[{
        "dateTime":Date,
        "userAgent":String
    }]
});

let User; 

exports.initialize = () => {
    return new Promise((resolve,reject) => {
        let db = mongoose.createConnection("mongodb+srv://senecaweb.rsbwdc7.mongodb.net/a5", { useNewUrlParser: true });
        db.on('error', (err) =>{
            reject(err);
        })
        db.once('open', () => {
            User = db.model("Users",userSchema);
            resolve("connected to mongodb");
        })
    })
};

exports.registerUser = (userData) => {
    return new Promise((resolve, reject) => {
        if (userData.password != userData.password2) {
            reject("Passwords do not match");
        }
        else {
            bcrypt.genSalt(10, function(err, err2) {
                bcrypt.hash(userData.password, 10, function(err, hash) {
                    if (err) {
                        reject("error in password");
                    }
                    else {
                        userData.password = hash;
                        let newUser = new User(userData);
                        newUser.save((err) => 
                        {
                            if (err) {
                                if (err.code === 11000) {
                                    reject("User Name already taken");
                                }
                                else {
                                    reject("There was an error creating the user: " +err);
                                }
                            }
                            else {
                                resolve();
                            }
                        })
                    }
                })
            })
        }
    })
};


exports.checkUser = (userData) => {
    return new Promise((resolve, reject) => {
        User.find({userName:userData.userName})
        .exec()
        .then(users => {
            bcrypt.compare(userData.password, users[0].password).then(res => {
                if(res === true){   
                    users[0].loginHistory.push({dateTime:(new Date()).toString(),userAgent:userData.userAgent});
                    User.update(
                        { userName: users[0].userName },
                        { $set: {loginHistory: users[0].loginHistory} },
                        {multi: false}
                    )
                    .exec()
                    .then(() => {resolve(users[0])})
                    .catch(err => {reject("There was an error verifying the user: "+ err)})
                }
                else {
                    reject("Incorrect Password"); 
                }
            })
        })
        .catch(() => { 
            reject("Unable to find username: " + userData.userName); 
        }) 
    })
};