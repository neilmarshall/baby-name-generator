const express = require('express');
const session = require('express-session')
const hbs = require('express-handlebars');
const morgan = require('morgan');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const connectEnsureLogin = require('connect-ensure-login');
const flash = require('connect-flash');
const config = require('./config.js');
const repository = require('./names-repository.js');

// instantiate application
const app = express();


// set up templating engine
app.engine('hbs', hbs({
    extname: 'hbs',
    defaultLayout: 'main',
    layoutsDir: __dirname + '/../views/layouts/',
    partialsDir: __dirname + '/../views/partials/'
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
app.use(morgan('combined'))
app.use(express.static(`${__dirname}/../static`));
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
app.get('/', connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
    res.render('index', {
        isAdmin: req.user.role === config.userRoles.ADMIN,
        username: req.user.username,
        otherUsers: await repository.getUsers()
            .then(response =>
                response.map(obj => obj.username)
                    .filter(name => name !== req.user.username)
                    .sort())
            .catch(err => console.error(err))
    });
});

app.get('/login', (req, res) => {
    if (req.user) { return res.redirect('/'); }
    const errorMsgs = req.flash('error');
    const errors = {message: errorMsgs && errorMsgs[0] ? errorMsgs[0] : null};
    res.render('login', {errors});
});

app.get('/logout', connectEnsureLogin.ensureLoggedIn(), function(req, res){
    req.logout();
    res.redirect('/');
});

app.get('/api/names', loggedInOr401, async (req, res) => {
    res.status(200).send(await repository.getNames());
});

app.get('/api/favouritenames/:username', loggedInOr401, async (req, res) => {
    repository.getFavouriteNames(req.params.username)
        .then(response => res.status(200).send(response))
        .catch(err => console.error(err));
});


// POST
app.post('/login',
    passport.authenticate('local',
        {successRedirect: '/', failureRedirect: '/login', failureFlash: true})
);

app.post('/api/names/:name', loggedInOr401, (req, res) => {
    repository.addName(req.params.name)
        .then(obj => res.status(201).send(obj))
        .catch(err => console.error(err));
});

app.post('/api/favouritenames', loggedInOr401, (req, res) => {
    repository.addFavouriteNames(
            req.body.preferredName,
            req.body.unpreferredName,
            req.body.username,
            new Date())
        .then(obj => res.status(201).send(obj))
        .catch(err => console.error(err));
});

app.post('/api/users', loggedInOr401, async (req, res) => {
    if (req.user.role !== config.userRoles.ADMIN)
        return res.status(401).send();

    bcrypt.hash(req.body.password, 10)
        .then(hash => repository.addUser(req.body.username, hash, req.body.role === config.userRoles.ADMIN))
        .then(userCreated => userCreated ? res.status(201).send() : res.status(409).send())
        .catch(err => console.error(err));
});

// PATCH
app.patch('/api/users', loggedInOr401, async (req, res) => {
    repository.validatePassword(req.user.id, req.body.currentPassword)
        .then(validated =>
            validated
                ? bcrypt.hash(req.body.newPassword, 10)
                    .then(hash => repository.updatePassword(req.user.id, hash))
                    .then(passwordUpdated => passwordUpdated ? res.status(204).send() : res.status(500).send())
                    .catch(err => console.error(err))
                : res.status(401).send())
        .catch(err => console.error(err));
});


// DELETE
app.delete('/api/names/:name', loggedInOr401, (req, res) => {
    repository.deleteName(req.params.name)
        .then(() => res.status(204).send())
        .catch(err => console.error(err));
});


// run server
app.listen(config.PORT)
console.info(`Application starting; listening on port ${config.PORT}`);
