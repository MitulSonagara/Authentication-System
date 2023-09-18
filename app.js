const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

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

const secret = "ThisIsMyEncryptionKey"
userSchema.plugin(encrypt,{secret:secret,encryptedFields:["password"]})

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
    await User.create({
        email: req.body.username,
        password: req.body.password
    })

    try {
        res.render("secrets")
    } catch (err) {
        console.error(err);
        res.render("register", { errorMessage: "Registration failed. Please try again." });
    }


});

app.post('/login', async (req, res) => {
    const username = req.body.username
    const entered_password = req.body.password

    try {
        const userfound = await User.findOne({ email: username })
        console.log(userfound)
        if (userfound.password === entered_password) {
            res.render("secrets")
        } else {
            res.render("login")
        }
    } catch (err) {
        console.error(err);
        res.render("login", { errorMessage: "Invalid email or password. Please try again." })
    }


})

app.listen(4000, () => {
    console.log("Server started on port 4000");
});
