const Review = require("../models/review.js");
const Listing = require('../models/listing.js');     

// for create a review for a listing
module.exports.createReview = async (req,res)=>{
    let {id} = req.params; 
    let listing  = await Listing.findById(id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    req.flash("success",`New Review created`);
    res.redirect(`/listings/${id}`)
};

// for delete a review for a lsiting
module.exports.destroyReview = async (req,res)=>{
    let{id,reviewId} = req.params;
    await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash("success",` Review deleted`);
    res.redirect(`/listings/${id}`)
};