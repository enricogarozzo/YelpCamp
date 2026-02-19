const express = require('express');
const router = express.Router();
const campgrounds = require('../controllers/campgrounds.js')
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const {campgroundSchema, reviewSchema} = require('../schemas.js');
const Campground = require('../models/campground');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');
const Review = require('../models/review');
const multer = require('multer');
const{ storage } =require('../cloudinary');
const upload = multer({ storage })


//use router.route 

router.route('/')
.get(catchAsync(campgrounds.index))
.post(isLoggedIn, upload.array('image'), validateCampground, catchAsync (campgrounds.createCampground))

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));

router.get('/new', isLoggedIn, campgrounds.renderNewForm );

router.route('/:id')
.get(catchAsync(campgrounds.showCampground))
.put(isLoggedIn, isAuthor, upload.array('image'), catchAsync(campgrounds.updateCampground))
.delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground))




module.exports = router;