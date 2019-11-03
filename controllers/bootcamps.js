const Bootcamp = require('../models/Bootcamp');
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const geoCoder = require("../utils/geocoder");

// @desc    Get all bootcamps
// @route   GET /api/v1/bootcamps
// @access  Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
	let query;
	let queryStr = JSON.stringify(req.query);
	queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
	console.log(queryStr);
	query = Bootcamp.find(JSON.parse(queryStr));
	const bootcamps = await query;

	res.status(200).json({ success: true, count: bootcamps.length, data: bootcamps });
});

// @desc    Get single bootcamp
// @route   GET /api/v1/bootcamps/:id
// @access  Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
	const bootcamp = await Bootcamp.findById(req.params.id);

	if (!bootcamp) {
		return next(new ErrorResponse(`Bootcamp not found with ID ${req.params.id}`, 404));
	}
	res.status(200).json({ success: true, data: bootcamp });
});

// @desc    Create new bootcamp
// @route   POST /api/v1/bootcamps/
// @access  Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
	const bootcamp = await Bootcamp.create(req.body);
	res.status(201).json({ success: true, data: bootcamp });	
});

// @desc    Update a bootcamp
// @route   POST /api/v1/bootcamps/:id
// @access  Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
	const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
		runValidators: true
	});

	if (!bootcamp) {
		return next(new ErrorResponse(`Bootcamp not found with ID ${req.params.id}`, 404));
	}
	res.status(201).json({ success: true, data: bootcamp });
});

// @desc    Delete a bootcamp
// @route   POST /api/v1/bootcamps/:id
// @access  Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
	const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);
	if (!bootcamp) {
		return next(new ErrorResponse(`Bootcamp not found with ID ${req.params.id}`, 404));
	}
	res.status(201).json({ success: true, data: {} });
});

// @desc    Get bootcamps within radius
// @route   GET /api/v1/bootcamps/radius/:zipcode/:distance
// @access  Private
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
	const { zipcode, distance } = req.params;

	// Get lat, long from geocoder
	const loc = await geoCoder.geocode(zipcode);
	const latitude = loc[0].latitude;
	const longitude = loc[0].longitude;

	// Calc radius using radians
	// Divide distance by radius of earth
	// Earth radius: 3,963miles / 6378 km
	const radius = distance / 6378;
	const bootcamps = await Bootcamp.find({
		location: {
			$geoWithin: {
				$centerSphere: [
					[longitude, latitude],
					radius,
				]
			}
		}
	});

	res.status(200).json({ success: true, count: bootcamps.length, data: bootcamps })
});
