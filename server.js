const config = require('./config.js');
const repository = require('./names-repository.js');
const express = require('express');
const session = require('express-session')
const hbs = require('express-handlebars');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const connectEnsureLogin = require('connect-ensure-login');
var flash = require('connect-flash');

// instantiate application
const app = express();


// set up templating engine
app.engine('hbs', hbs({
    extname: 'hbs',
    defaultLayout: 'main',
    layoutsDir: __dirname + '/views/layouts/'
}));

app.set('view engine','hbs');


// define authorization strategy
passport.use(new LocalStrategy(
    async function(username, password, done) {
        try {
            const user = await repository.getUser(username);
            if (!username || !user)
                return done(null, false, {message: 'Incorrect username or password'});

            const passwordMatches = await bcrypt.compare(password, user.password);
            if (!password || !passwordMatches)
                return done(null, false, { message: 'Incorrect username or password' });

            done(null, user);
        } catch (err) {
            return done(err);
        }
  }
));

passport.serializeUser(function(user, done) {
    done(null, user._id);
});

passport.deserializeUser(async function(id, done) {
    const user = await repository.getUserById(id);
    done(null, {id: user._id, username: user.username, role: user.role});
});


// establish middleware pipelines
app.use(express.static(`${__dirname}/static`));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(session({
    secret: config.SECRET,
    resave: true,
    saveUninitialized: true}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

const loggedInOr401 = (req, res, next) => req.user ? next() : res.status(401).send();


// GET
app.get('/', connectEnsureLogin.ensureLoggedIn(), (req, res) => {
    // If this function gets called, authentication was successful
    // `req.user` contains the authenticated user

    // TODO - do something with the req.user object!!!
    console.log(req.user);
    res.render('index', {isAdmin: req.user.role === config.userRoles.ADMIN});
});

app.get('/login', (req, res) => {
    const errorMsgs = req.flash('error');
    const errors = {message: errorMsgs && errorMsgs[0] ? errorMsgs[0] : null};
    res.render('login', {errors});
});

app.get('/logout', connectEnsureLogin.ensureLoggedIn(), function(req, res){
    req.logout();
    res.redirect('/');
});

app.get('/api/names', loggedInOr401, async (req, res) => {
    res.send(await repository.getNames());
});

app.get('/api/favouritenames/:username', loggedInOr401, async (req, res) => {
    const username = req.params.username;
    res.send(await repository.getFavouriteNames(username));
});


// POST
app.post('/login',
    passport.authenticate('local',
        {successRedirect: '/', failureRedirect: '/login', failureFlash: true})
);

app.post('/api/names/:name', loggedInOr401, async (req, res) => {
    const obj = await repository.addName(req.params.name);
    res.status(201).send(obj);
});

app.post('/api/favouritenames', loggedInOr401, async (req, res) => {
    const obj = await repository.addFavouriteNames(
        req.body.preferredName,
        req.body.unpreferredName,
        req.body.username,
        new Date());
    res.status(201).send(obj);
});

app.post('/api/users', loggedInOr401, async (req, res) => {
    if (req.user.role !== config.userRoles.ADMIN)
        return res.status(401).send();

    bcrypt.hash(req.body.password, 10)
        .then(hash => repository.addUser(req.body.username, hash, req.body.role === config.userRoles.ADMIN))
        .then(userCreated => userCreated ? res.status(201).send() : res.status(409).send())
        .catch(err => console.log(err));
});


// DELETE
app.delete('/api/names/:name', loggedInOr401, async (req, res) => {
    await repository.deleteName(req.params.name);
    res.status(204).send();
});


// run server
app.listen(config.PORT)
