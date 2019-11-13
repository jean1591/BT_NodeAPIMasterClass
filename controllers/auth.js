const User = require('../models/User');
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
    const { name, email, password, role } = req.body;

    // Create user
    const user = await User.create({
        name, email, password, role
    });

    // Create token
    const token = user.getSignedJwtToken();

    res.status(200).json({
        success: true,
        token
    });
});


// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    // Validates e-mail and password
    if (!email || !password) {
        return next(new ErrorResponse("Please provide and e-mail and a password", 400));
    }

    // Check for user
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
        return next(new ErrorResponse("Invalid credentials", 401));
    }

    // Check if passwords matches
    const isMatched = await user.matchPassword(password)

    if (!isMatched) {
        return next(new ErrorResponse("Invalid credentials", 401));
    }

    // Create token
    const token = user.getSignedJwtToken();

    res.status(200).json({
        success: true,
        token
    });
});