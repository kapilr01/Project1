const Listing = require('./models/listing');
const Review = require('./models/review.js');
const ExpressError = require('./utils/ExpressError.js');
const {listingschema ,reviewSchema} = require('./schema.js');


module.exports.isLoggedIn = (req,res,next) =>{
    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl; // passport isae khali krr dega or phir agar acces krengae toh undefined dega 
        req.flash("error", "You must be Login to create listing");
        return res.redirect("/login");
    }
    next();
}

module.exports.saveRedirectUrl = (req,res ,next)=>{// isliyae yahan save krewa dengae 
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
}

module.exports.isOwner = async(req,res,next) => { // validate the user is owner or not
    const { id } = req.params;
    let listing = await Listing.findById(id);
    if(!listing.owner.equals(res.locals.currUser._id)){ // for Authorization
        req.flash("error", "You are not the onwer of this lisitng");
        return res.redirect(`/listings/${id}`);
    }
    next();
}

//Update validationListing
module.exports.validationListing = (req, res, next) => {
    let { error } = listingschema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

module.exports.validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

module.exports.isReviewAuthor = async(req,res,next) => { // validate review with the owner
    const { id , reviewId} = req.params;
    let review = await Review.findById(reviewId);
    if(!review.author.equals(res.locals.currUser._id)){ // for Authorization
        req.flash("error", "You are not the author of this review");
        return res.redirect(`/listings/${id}`);
    }
    next();
}