if(process.env.NODE_ENV != "production"){
    require('dotenv').config()
}

const mongoose = require('mongoose');
const express = require('express');
const app = express();
const path = require('path');
const port = 8080;
const methodOverride = require('method-override');
const ejsMate = require("ejs-mate");
const session = require('express-session');// for cookies sessions track
const ExpressError = require('./utils/ExpressError.js');
const flash = require('connect-flash');
const passport = require('passport');
const localStratergy = require('passport-local');
const User = require('./models/user.js');
const MongoStore = require('connect-mongo');



const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require('./routes/user.js');
const { error } = require('console');

const dbURL = process.env.ATLASDB_URL;

main().then(()=>{
    console.log("Connection successfull");
})
.catch(err => console.log(err));

async function main() {
  await mongoose.connect(dbURL);
}

app.listen(port , ()=>{
    console.log("app is listening");
});


app.set("view engine" , "ejs");
app.set("views", path.join(__dirname,"views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

const store = MongoStore.create({
    mongoUrl : dbURL,
    crypto: {
        secret:process.env.SECRET,
    },
    touchAfter : 24 * 3600,
})

store.on("error" , ()=>{
    console.log("Error in the mongo session", error);
})

const sessionOptions = { // session id 
    store,
    secret : process.env.SECRET,
    resave : false,
    saveUninitialized : true,
    cookie : {
        expires : Date.now() + 7 * 24 * 60 * 60 *1000,// days*hours*sec*milisec itnae time kae baad expire hoga
        maxAge : 7 * 24 * 60 * 60 *1000,
        httpOnly : true,
    }
}
app.use(session(sessionOptions));
app.use(flash()); // in dono ko routes sae pehlae rkhna hoga 

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStratergy(User.authenticate()));

passport.serializeUser(User.serializeUser()); // user sae related info store krwane kae liyae 
passport.deserializeUser(User.deserializeUser()); // user sae related info store krwane kae liyae 

app.use((req,res,next)=>{ // middleware must use before the routes 
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
})

app.get("/demouser" , async(req,res)=>{
    let fakeUser = new User({
        email : "ana@gmail.com",
        username : "ana",
    });
    let registerdUser = await User.register(fakeUser,"Lucky@2003");
    res.send(registerdUser);
})
//Routes files
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews" , reviewRouter);
app.use("/", userRouter);


app.all("*", (req, res, next) => { // to check all error from all routes 
    next(new ExpressError(404, "Page not Found"));
});

app.use((err, req, res, next) => {
    const { statusCode = 500, message = "Something went wrong" } = err;
    if (res.headersSent) {
        return next(err);
    }
    res.status(statusCode).render("error.ejs", { message });
});
