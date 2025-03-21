const Listing = require('./models/listing.js');
const Review = require('./models/review.js');
const ExpressError = require("./utils/ExpressError.js"); 
const {listingSchema,reviewSchema} = require("./schema.js");

// it ensure that user is logged in for changes in any listing or create a new listing
module.exports.isLoggedIn = (req,res,next)=>{
    if (!req.isAuthenticated()) {
        //redirecturl save
        req.session.redirectUrl = req.originalUrl;
        req.flash("error","you must be logged in ");
       return  res.redirect("/login");
    }
    next();
}

// it is middleware which use to save our curr path url in locals so that we track our path for redirect correct path after log in
module.exports.saveRedirectUrl = (req,res,next)=>{
    if(!req.isAuthenticated()&&req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};

// for check curr user is same as owner of this listing
module.exports.isOwner = async(req,res,next)=>{
    let { id } = req.params;    
    let listing = await Listing.findById(id);
    if(!listing.owner._id.equals(res.locals.currUser._id)){
        req.flash('error',"you are not the owner of this listing ");
       return  res.redirect(`/listings/${id}`);
    }
    next();
}

// for validate out listing
module.exports.validateListing = (req,res,next)=>{
    let {error} = listingSchema.validate(req.body);
    if(error){
        //agar hamare pass extra details aaye to 
        let errMsg = error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errMsg);
    }else{
        next();
    }   
};

//for valide our review
module.exports.validateReview = (req,res,next)=>{
    let {error} = reviewSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errMsg);
    }else{
        next();
    }
};

// for review check curr user and author of review
module.exports.isReviewAuthor = async(req,res,next)=>{
    let { id,reviewId } = req.params;    
    let review = await Review.findById(reviewId);
    if(!review.author._id.equals(res.locals.currUser._id)){
        req.flash('error',"you are not the author of this review ");
       return  res.redirect(`/listings/${id}`);
    }
    next();
}