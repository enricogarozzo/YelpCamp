if(process.env.NODE_ENV !== "production"){
    require('dotenv').config();
}


const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require ('ejs-mate');
const session = require('express-session');
const sanitizeV5 = require('./utils/mongoSanitizeV5.js');
const ExpressError = require('./utils/ExpressError.js');
const methodOverride = require('method-override');
//it allows us to implement different strategies for authentication
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const helmet = require('helmet');
const { MongoStore } = require('connect-mongo');
const app = express();

if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
}




const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/", 
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/", 
];
const connectSrcUrls = [
    "https://api.maptiler.com/", 
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/`, //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);




const userRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');




const flash = require('connect-flash');
const { getMaxListeners } = require('events');

const dbUrl = process.env.DB_URL || 'mongodb://127.0.0.1:27017/yelp-camp';

// 'mongodb://localhost:27017/yelp-camp-maptiler'

mongoose.connect(dbUrl, {
    //these are deprecated options in the new versions
    // useNewUrlParser: true,
    // useUnifiedTopology: true
    //useFindAndModify: false
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", ()=>{
    console.log("Database connected");
});


app.set('query parser', 'extended');

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname,'views'));
app.use(express.static(path.join(__dirname,'public')));
app.use(sanitizeV5({ replaceWith: '_' }));

//with this line express can parse the request body
app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));


const store = MongoStore.create({
    mongoUrl: dbUrl, 
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret: process.env.SECRET
    }
});


store.on('error', function(e){
    console.log("session error",e);
})
const sessionConfig = {
    store,
    name: 'session',
    secret : process.env.SECRET,
    resave : false,
    saveUninitialized: false,
    cookie :{
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax', 
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 *7),
        maxAge: 1000 * 60 * 60 * 24 *7
    }
}

app.use(session(sessionConfig));
app.use(flash());
//we need the passport uses fo the authentication sessions
// use sessiong must be before passport.session
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

//this tells passport how to serialize the user - store the information about the user in the session
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    console.log(req.query);
    //console.log(req.session); line used to see the data passed on the session
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});


app.get('/fakeUser', async(req,res)=>{
    const user = new User({email: 'colt@gmail.com', username : 'colttt'})
    const newUser = await User.register(user, 'chicken');
    res.send(newUser);
})

app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);


app.get('/', (req,res)=>{
    res.render('home')
});

app.all(/(.*)/, (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const {statusCode = 500} = err;
    if (!err.message) err.message = 'Ops, something went wrong'
    res.status(statusCode).render('error', {err})
})

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Serving on port ${port}`);
});

module.exports = app;