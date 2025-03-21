if(process.env.NODE_ENV!="production"){
    require('dotenv').config();
}

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const ejsMate = require("ejs-mate");
let port = 8080;
const path = require("path");
const methodOverride = require('method-override');
app.use(methodOverride('_method'));
app.set('view engine', "ejs");
app.use(express.urlencoded({extended:true}));
app.set("views",path.join(__dirname,"views"));
app.engine('ejs',ejsMate);
const ExpressError = require("./utils/ExpressError.js"); 
app.use(express.static(path.join(__dirname,"/public")));
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const dbUrl = process.env.ATLASDB_URL;

main()
.then(()=>{
    console.log("connection successful");
})
.catch((err)=>{
    console.log(err);
});

async function main(){
    await mongoose.connect(dbUrl);
}

const store = MongoStore.create({
    mongoUrl : dbUrl,
    crypto :{
        secret : process.env.SECRET,
    },
    touchAfter : 24*3600, // in seconds
});

store.on("error",()=>{
    console.log("ERROR in MONGO SESSION STORE",err);
});

const sessionOptions = {
    store,
    secret : process.env.SECRET,   
    resave : false,
    saveUninitialized : true,
    cookie : {
        expires : Date.now()+ 7*24*60*60*1000 , // here date.now return in milisec that's way we multiply 1000
        maxAge : 7*24*60*60*1000,
        httpOnly : true
    }
};


// session and flash middleware
app.use(session(sessionOptions));
app.use(flash());   

//passport intialize
app.use(passport.initialize());
//  implement passport session
app.use(passport.session());
//use local strategy  
passport.use(new LocalStrategy(User.authenticate()));
//serialize and deserialize to user
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    
    // because we direct can't access req.user in ejs template  
    res.locals.currUser = req.user;
    next();
});

// for demo user
// app.get("/demoUser",async(req,res)=>{
//     let fakeUser = new User({
//         email:"bj@gmail.com",
//         username:"bjstu"
//     });

//     let registerdUser = await User.register(fakeUser,"bj@123");
//     res.send(registerdUser);
// });

app.get("/"(req,res)=>{
    res.redirect("/listings");
});
// for use all listing routes
app.use("/listings",listingRouter);
// for use all review routes
app.use("/listings/:id/reviews",reviewRouter);
//for our user router
app.use("/",userRouter);

// if user send request such page which is not found 
app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"Page not Found!"));
});

//error handling middleware 
app.use((err,req,res,next)=>{
    let{status=500,message = "Something went's wrong"} = err;
    res.status(status).render("error.ejs",{message});
    // res.status(status).send(message);
});

app.listen(port,()=>{
    console.log(`server is listening on port ${port}`);
});
