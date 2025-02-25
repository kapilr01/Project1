const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync.js');
const ExpressError = require('../utils/ExpressError.js');
const {listingschema} = require('../schema.js');
const Listing = require('../models/listing.js');
const {isLoggedIn, isOwner , validationListing} = require('../middleware.js');
const lisitngController = require("../controllers/listings.js");

const multer  = require('multer')

const {storage} = require('../cloudConfig.js');
const upload = multer({ storage});

router
    .route("/")
    .get(wrapAsync(lisitngController.index))
    .post(isLoggedIn, upload.single("listing[image]"), wrapAsync(lisitngController.createListing));



// new or cretae route 
router.get("/new",isLoggedIn, lisitngController.renderNewForm);


router.route("/:id")
    .get(wrapAsync(lisitngController.showListings)) // Show Route
    .put(
        isLoggedIn,
        isOwner,
        upload.single("listing[image]"),  // ✅ Pehle image upload karega
        validationListing,  // ✅ Phir listing validate karega
        wrapAsync(lisitngController.updateListing) // ✅ Finally update karega
    )
    .delete(isLoggedIn, isOwner, wrapAsync(lisitngController.destroyListing)); // Delete route



// edit route
router.get("/:id/edit",isLoggedIn,isOwner ,wrapAsync( lisitngController.renderEditForm));


module.exports = router;
