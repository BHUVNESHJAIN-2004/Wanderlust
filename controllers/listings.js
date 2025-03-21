const Listing = require('../models/listing.js');

// index (show all lsiting)
module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
};

// for adding new listing render a new form 
module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

// for show a listing using it's id
module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    //here populate means show entire schema 
    const list = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "author"  // here for populate author of a review
            }
        }).populate("owner");

    if (!list) {
        req.flash("error", "Listing doesn't Exist !");
        res.redirect("/listings");
    }
    // console.log(list);
    res.render("listings/show.ejs", { list });
};

//create a new listing 
module.exports.createListing = async (req, res, next) => {

    let url = req.file.path;
    let filename = req.file.filename;

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };
    await newListing.save();
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
};

// render a edit form for a lisitng         
module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    const list = await Listing.findById(id);
    if (!list) {
        req.flash("error", "Listing doesn't Exist !");
        res.redirect("/listings");
    }
    let originalImageUrl = list.image.url;    
    originalImageUrl = originalImageUrl.replace("/upload","/upload/h_300,w_250");
    res.render("listings/edit.ejs", { list,originalImageUrl });
};

// for update a listing
module.exports.updateListing = async (req, res) => {

    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing }); // yha hm deconstruct kar rhe hai becayuse req.body.listing ek js object hai 

    // if we do not update image than our url and filename is empty
    if (typeof req.file !=="undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
        await listing.save();
    }
    req.flash("success", `${listing.title} updated`);
    res.redirect(`/listings/${id}`);
};

// for delete a lisitng using it's id
module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    req.flash("success", `${deletedListing.title} is deleted`);
    res.redirect("/listings");
};