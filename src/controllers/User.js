const mongoose = require("mongoose");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require('uuid');

exports.saveCreds = (req,res,next) => {
    if(req.body.password.includes("&")) 
    return res.status(500).json({
        error: 'Invalid Personal Access Token'
    })
    let buff = new Buffer(req.body.password.trim());
    let base64data = buff.toString('base64');
    let data = {
        username: req.body.username,
        password: base64data,
    }
    let auth_token = uuidv4();
    User.findOne()
    .then((resp) => { 
        bcrypt.hash(auth_token, 8, async (err, hash) => {
            if (err) {
                return res.status(500).json({
                  error: err,
                });
            } else {
                data.auth = hash; 
                if(resp) {
                    User.findByIdAndUpdate(resp._id, data)
                    .then(() => {
                        return res.status(200).json({
                            auth_token
                        });
                    })
                    .catch((e) => {
                        res.status(500).json(e);
                    })
                } else {
                    data._id = mongoose.Types.ObjectId();
                    const user = new User(data)
                    user
                    .save()
                    .then(() => {
                        res.status(200).json({
                            auth_token
                        });
                    })
                    .catch((e) => {
                        res.status(500).json(e);
                    })
                }
            }
        })
        
    })
    .catch((e) => {
        console.log(e);
        res.status(500).json(e);
    })
}


exports.getCreds = (req,res,next) => {
    User.findOne()
    .then((resp) => {
        let buff2 = new Buffer(resp.password, 'base64');
        let text = buff2.toString('ascii');
        resp.password = text;
        res.status(200).json(resp)
    })
    .catch((err) => {
        res.status(400).json({
           error: err,
        })
    })
}