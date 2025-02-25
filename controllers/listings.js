const Listing = require('../models/listing');

module.exports.index = async (req, res) => {
    let query = {}; // Default empty query

    if (req.query.location) {
        query.location = new RegExp("^" + req.query.location + "$", "i"); // Case-insensitive search
    }

    if (req.query.category) {
        query.category = new RegExp("^" + req.query.category + "$", "i"); // Case-insensitive search
    }

    const allListings = await Listing.find(query);
    res.render("listings/index.ejs", { allListings });
};


module.exports.renderNewForm = (req,res)=>{
    res.render("listings/new.ejs");
};

module.exports.showListings = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id).populate({path: "reviews",populate : {path : "author"},}).populate("owner");
    if (!listing) {
        req.flash("error", "Listing Not Exist !");
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing });
};
module.exports.createListing = async (req, res, next) => {
    console.log("File received:", req.file);

    let url = req.file.path;
    let filename = req.file.filename;
    const newlisting = new Listing(req.body.listing);
    
    newlisting.owner = req.user._id;
    newlisting.image = { url, filename };
    
    await newlisting.save();
    req.flash("success", "New listing Created");
    res.redirect("/listings");
};


module.exports.renderEditForm = async(req,res)=>{
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error", "Listing Not Exist !");
        
        res.redirect("/listings");
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250")
    res.render("listings/edit.ejs", {listing, originalImageUrl});
};

module.exports.updateListing = async (req, res) => {
    const { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    if (req.file) {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
    }
    await listing.save();

    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
};



module.exports.destroyListing =  async(req,res)=>{
    const { id } = req.params;
    await Listing.findByIdAndDelete(id); // if this is called so it call mongoose middleware to delete review reference
    req.flash("success" , "listing Deleted!!");
    res.redirect(`/listings`);
};