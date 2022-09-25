require('dotenv').config()
const express = require('express');
const app = express();
const morgan = require('morgan');
const PORT = process.env.PORT;
require('./src/db/mongo')
const mongoose = require("mongoose");
const Service = require("./src/models/Service");
// Routes
const userRoutes = require("./src/routes/User");
const repoRoutes = require("./src/routes/Repo");


app.use(express.json());
app.use(morgan('dev'))

// Middleware for routes
app.use("/user", userRoutes);
app.use("/repo", repoRoutes);

Service.findOne({ name: 'mongo' })
.then((resp) => {
    if(!resp) {
        let service = new Service({
            _id: mongoose.Types.ObjectId(),
            name: 'mongo',
            commit:'this is a demo commit',
            port: 27017    
        })
        service.save() 
        .then((resp2) => {
            console.log(resp2);
        })
        .catch((e) => {
            console.log(e);
        })
    }
})
.catch((e) => {
    console.log(e);
})

app.get('/',(req,res) => {
    res.send('Welcome to QuiCLI')
})

app.listen(PORT,() => {
    console.log(`running on port: ${PORT}`);
})
