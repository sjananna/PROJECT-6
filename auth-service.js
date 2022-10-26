
const bcrypt = require("bcryptjs");
const { default: mongoose } = require("mongoose");
const { password } = require("pg/lib/defaults");
var Schema = mongoose.Schema;

var userSchema = new Schema ({
    "userName": {
        "type": String,
        "index": true,
        "unique": true
        },
    "password": String,
    "email": String,
    "loginHistory": [
        {
            "dateTime": Date,
            "userAgent": String
        }
    ]
});

let User; 

module.exports.initialize = function () {
    return new Promise(function (resolve, reject) {

        let db = mongoose.createConnection("mongodb+srv://dbUser:12345@testweb.dhgik.mongodb.net/myFirstDatabase?retryWrites=true&w=majority");

        db.on('error', (err)=>{
            reject(err); // reject the promise with the provided error
        });
        db.once('open', ()=>{
            User = db.model("users", userSchema);
            resolve();
        });
    });
};

module.exports.registerUser = function (userData) {
    return new Promise(function(resolve, reject) {
        if(userData.password != userData.password2) {
            reject("Passwords do not match");
        }
        else{
            bcrypt.hash(userData.password, 10).then(hash => {
                let newUser = new User(userData);
                newUser.password = hash;
                newUser.save((error) => {
                    if(!error){
                        resolve("User has created.");
                    }
                    else if(error.code == 11000){
                        reject("User Name already taken");
                    }
                    else{
                        reject("There was an error creating the user: " + error);
                    }
                    
                });
            })
            .catch(err => {
                console.log(err);
                reject("There was an error encrypting the password");
            })
            
        }
    });
};

module.exports.checkUser = function (userData) {
    return new Promise(function(resolve, reject) {
        User.find({userName: userData.userName})
        .exec()
        .then((users) => {

            users = users.map(value => value.toObject());

            if(!users){
                reject("Unable to find user: " + userData.userName);
            }
            else{
                bcrypt.compare(userData.password, users[0].password).then(result => {
                    if(result === true){
                        users[0].loginHistory.push( {
                            dateTime: (new Date()).toString(), 
                            userAgent: userData.userAgent
                        })
                        User.updateOne(
                            {userName: users[0].userName},
                            { $set: {loginHistory: users[0].loginHistory}}
                        )
                        .exec()
                        .then(() => {
                            resolve(users[0])
                        })
                        .catch((err) => {
                            reject("There was an error verifying the user: " + err)
                        })
                    }
                    else{
                        reject("Incorrect Password for user: " + userData.userName);
                    }
                })
                .catch(err => {
                    reject(err);
                })
            }
        })
        .catch((error) => {
            reject("Unable to find user: " + userData.userName);
        })
    });
}