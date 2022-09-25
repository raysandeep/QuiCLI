const bcrypt = require('bcrypt');
const User = require('../models/User');

const auth = (req, res, next) => {
    try{
        let auth = req.headers.authorization;
        if(!auth || auth === '') 
        return res.status(401).json({error:'No Auth Token Found'})
        User.findOne()
        .then((resp) => {
            bcrypt.compare(auth, resp.auth, (err, result) => {
                if(!result)
                return res.status(401).json({
                  error:'Incorrect  Auth Token'
                });
                next();
            })
        })
    } catch(e) {
        res.status(401).json({error:'Auth Failed'});
    }
}

module.exports = auth