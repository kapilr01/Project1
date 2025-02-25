const express = require('express');
const router = express.Router({mergeParams : true});
const {listingschema , reviewSchema} = require('../schema.js');
const Review = require('../models/review.js');
const wrapAsync = require('../utils/wrapAsync.js');
const ExpressError = require('../utils/ExpressError.js');
const Listing = require('../models/listing.js');
const {validateReview, isLoggedIn, isReviewAuthor} = require('../middleware.js');

const reviewController = require('../controllers/reviews.js');

//Review 
// Post route
router.post("/",isLoggedIn,validateReview,wrapAsync(reviewController.createReview));

// Review 
// delete route
router.delete("/:reviewId",isReviewAuthor,isLoggedIn, wrapAsync(reviewController.destroyReview));

module.exports = router;
