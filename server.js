const express = require('express');
const bodyParser = require('body-parser');

//create express app
const app = express();

//parse requests
app.use(bodyParser.urlencoded({ extended: true }))

//parse request of content type = application/json
app.use(bodyParser.json())

const dbConfig = require('./config/database.config.js');
const mongoose = require('mongoose');

//jwt authentication
const jwt = require('jsonwebtoken');

app.use(bodyParser.json());
mongoose.Promise = global.Promise;
//users
const users = [
    {
        username: 'john',
        password: 'password123admin',
        role: 'admin'
    }, {
        username: 'anna',
        password: 'password123member',
        role: 'member'
    }
];


const accesstokensecret = 'youraccesstokemsecret';
const refreshTokenSecret = 'yourrefreshtokensecrethere';
let refreshTokens = [];

app.post('/login', (req,res) => {
    const { username, password } = req.body;
    const user = users.find(user => { return user.username === username && user.password === password });

    if(user) {
        const accessTocken = jwt.sign({username: user.username, role: user.role},accesstokensecret, { expiresIn: '20m' } )
        const refreshToken = jwt.sign({username: user.username, role: user.role},refreshTokenSecret )
        refreshTokens.push(refreshToken);
        res.send({
            accessTocken,
            refreshToken,
            user : {
                username: user.username,
                role: user.role
            }
        });
    } else {
        res.send({
            message: "Username or password is incorrect"
        })
    }
})

app.post('/token', (req,res) => {
    const { token } = req.body;
    if(!token) {
        return res.sendStatus(401);
    }
    if(!refreshTokens.includes(token)) {
        return res.sendStatus(403);
    }
    jwt.verify(token, accesstokensecret, (err, user) => {
        if(err) {
            res,sendStatus(403);
        }
        const accessTocken = jwt.sign({username: user.username, role: user.role },accesstokensecret, {expiresIn: '20m'} )
        res.send({
            accessTocken
        });
    });
});
app.post('/logout', (req,res) => {
    const { token } = req.body;
    refreshTokens = refreshTokens.filter(t => {
        return t !== token;
    });
    console.log("Logout method");
    console.log(accessTocken);
    console.log(refreshTokens);
    res.send("Logout succesfully"); 
})
const books = [
    {
        "author": "Chinua Achebe",
        "country": "Nigeria",
        "language": "English",
        "pages": 209,
        "title": "Things Fall Apart",
        "year": 1958
    },
    {
        "author": "Hans Christian Andersen",
        "country": "Denmark",
        "language": "Danish",
        "pages": 784,
        "title": "Fairy tales",
        "year": 1836
    },
    {
        "author": "Dante Alighieri",
        "country": "Italy",
        "language": "Italian",
        "pages": 928,
        "title": "The Divine Comedy",
        "year": 1315
    },
];

const authenticateJWT = (req, res, next) => {
    const tokenSecret = 'youraccesstokemsecret';
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader;
        jwt.verify(token, tokenSecret, (err, user) => {
            if (err) {
                return res.sendStatus(403).send({
                    message: 'User dont have permissions to perform action'
                });
            }

            req.user = user;
            next();
        });
    } else {
        res.sendStatus(401);
    }
};
//books get api call
app.get('/books', authenticateJWT, (req,res) => {
    res.json(books);
})
app.post('/books',authenticateJWT, (req,res) => {
    const { role } = req.user;
    if(role != 'admin') {
        return res.sendStatus(403);
    }

    const book = req.body;
    books.push(book);
    res.send("Book Added Successfully");
})
// Connecting to the database
mongoose.connect(dbConfig.url, {
    useNewUrlParser: true
}).then(() => {
    console.log("Successfully connected to the database");    
}).catch(err => {
    console.log('Could not connect to the database. Exiting now...', err);
    process.exit();
});
app.get('/', (req,res) => {
    res.send("Welcome to the application")
});
require('./app/routes/note.routes.js')(app);
app.listen(4000, () => {
    console.log("server is running on 3000 port..............")
})