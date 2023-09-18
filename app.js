require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");
// const md5 = require('md5');
const bcrypt = require('bcrypt');

const saltRound = 10

const app = express();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

mongoose.connect("mongodb://127.0.0.1:27017/userDB", { useNewUrlParser: true, useUnifiedTopology: true });

mongoose.connection.on('connected', () => {
    console.log('Connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});

const userSchema = new mongoose.Schema({
    email: String,
    password: String,
})

// userSchema.plugin(encrypt,{secret:process.env.SECRET,encryptedFields:["password"]})

const User = mongoose.model("User", userSchema);

app.get('/', (req, res) => {
    res.render("home")
});

app.get('/login', (req, res) => {
    res.render("login")
});

app.get('/register', (req, res) => {
    res.render("register")
});

app.post('/register', async (req, res) => {

    await bcrypt.hash(req.body.password, saltRound, async (err, hash) => {
        await User.create({
            email: req.body.username,
            password: hash
        })

        try {
            res.render("secrets")
        } catch (err) {
            console.error(err);
            res.render("register", { errorMessage: "Registration failed. Please try again." });
        }

    })
});

app.post('/login', async (req, res) => {
    const username = req.body.username
    const entered_password = req.body.password

    try {
        const userfound = await User.findOne({ email: username })
        bcrypt.compare(entered_password, userfound.password, (err, result) => {
            if (result = true) {
                res.render("secrets")
            } else {
                res.render("login")
            }
        })
    } catch (err) {
        console.error(err);
        res.render("login", { errorMessage: "Invalid email or password. Please try again." })
    }


})

app.listen(4000, () => {
    console.log("Server started on port 4000");
});
