const User = require("../models/user.js");

//render a form for create a account for new user
module.exports.renderSignupForm = (req,res)=>{
    res.render("users/signup.ejs");
};

// signup user
module.exports.signup = async (req,res)=>{
    try{

        let {username,email,password} = req.body;
        const newUser = new User({email,username,password});
        const registerdUser = await User.register(newUser,password);
        console.log(registerdUser);
        req.login(registerdUser,(err)=>{
            if(err){
               return next(err);
            }
            req.flash("success","welcome to wanderlust");
            res.redirect("/listings");
        });
    }catch(e){
        req.flash("error",e.message);
        res.redirect("/signup"); 
    }
};

// render login form
module.exports.renderLoginForm = (req,res)=>{
    res.render("users/login.ejs");
};

// redirect url after login
module.exports.login = async(req,res)=>{
    req.flash("success","welcome back to wanderlust ! ");
    let redirectUrl = res.locals.redirectUrl||"/listings";
    // delete req.session.redirectUrl;
    res.redirect(redirectUrl);
};  

// logout   
module.exports.logout = (req,res,next)=>{
    req.logOut((err)=>{
        if(err){
            return next(err);
        }
        req.flash("success","you are logged out!");
        res.redirect("/listings");
    });
};