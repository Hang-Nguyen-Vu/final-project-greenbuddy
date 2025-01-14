import asyncHandler from "express-async-handler";
import bcrypt from "bcrypt";
import { validateRegistration } from "../middleware/registrationValidation";
import { UserModel } from "../models/UserModel";
import { AdModel } from "../models/AdModel";
// Import cloudinary configuration
import cloudinary from "../config/cloudinaryConfig";

// @desc    Register new user
// @route   POST api/register
// @access  Public

export const registerUserController = asyncHandler(async (req, res) => {
  // Run validation middleware
  validateRegistration(req, res, () => { });

  // Extract email, username, password and consent from the request body
  const { username, password, email, consent } = req.body;
  // In this try section of the try catch we will first do some conditional logic and then generate the newUser with a crypted password within the DB.
  try {
    // 1st Condition
    // Check whether all fields of registration logic are NOT [!email] inputted from the request.body object
    if (!username || !email || !password || !consent) {
      // if so, set http status to a 400code
      res.status(400);
      // and throw new error with some info
      throw new Error("Please add all fields");
    }

    // 2nd Condition
    // Check if the current user trying to register is using an username or email that matches with the same username or email in the database, so they would have to choose something diferent
    const existingUser = await UserModel.findOne({
      $or: [{ username }, { email }],
    });
    if (existingUser) {
      res.status(400);
      throw new Error(
        `User with ${existingUser.username === username ? "username" : "email"
        } already exists`
      );
    }

    // Generate a salt and hash the user's password
    //In this line below, we're using the bcrypt library to create a random value called "salt." The salt is added to the password before hashing it. It adds an extra layer of security by making it more difficult for attackers to use precomputed tables (rainbow tables) to crack passwords. The 10 in genSaltSync(10) represents the cost factor, which determines how computationally intensive the hashing process will be.
    const salt = bcrypt.genSaltSync(10);

    const hashedPassword = bcrypt.hashSync(password, salt);
    // In this line below, we're using the generated salt to hash the user's password. Hashing transforms the password into a secure and irreversible string of characters. The bcrypt library handles the entire process for us, ensuring that the password is securely hashed. The resulting hashedPassword is what we store in the database to keep the user's password safe.
    // Create a new user instance with the hashed password
    const newUser = new UserModel({
      username,
      email,
      password: hashedPassword,
      consent
    });

    // Description: Save the new user instance to the database
    await newUser.save();

    // Respond with a success message, user details, and the access token
    res.status(201).json({
      success: true,
      response: {
        username: newUser.username,
        email: newUser.email,
        id: newUser._id,
        accessToken: newUser.accessToken,
      },
    });
  } catch (e) {
    // Handle any errors that occur during the registration process
    res.status(500).json({ success: false, response: e.message });
  }
});


// @desc    Login Existing User
// @route   POST api/login
// @access  Public

export const loginUserController = asyncHandler(async (req, res) => {
  // Extract username and password from the request body
  const { username, password } = req.body;

  try {
    // Find a user with the provided username in the database
    const user = await UserModel.findOne({ username });
    if (!user) {
      // If no user is found with the provided username, respond with a 401 Unauthorized and a user not found message
      return res
        .status(401)
        .json({ success: false, response: "User not found" });
    }

    // Compare the provided password with the hashed password in the database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // If the provided password doesn't match the stored password, respond with a 401 Unauthorized and an incorrect password message
      return res
        .status(401)
        .json({ success: false, response: "Incorrect password" });
    }
    // Respond with a success message, user details, and the JWT token
    res.status(200).json({
      success: true,
      response: {
        username: user.username,
        id: user._id,
        accessToken: user.accessToken, //  token for the user using the acessToken generated from the model, // Use the generated token here
      },
    });
  } catch (e) {
    // Handle any errors that occur during the login process
    res.status(500).json({ success: false, response: e.message });
  }
});


// @desc    Retrieve all users
// @route   GET api/users
// @access  Private

export const getAllUsersController = asyncHandler(async (req, res) => {
  try {
    // Find all users in the database
    const users = await UserModel.find();

    if (users.length != 0) {
      res.status(200).json({
        success: true,
        response: users
      });
    } else {
      res.status(400).json({
        success: false,
        response: "Cannot retrieve users"
      });
    }
  } catch (e) {
    res.status(500).json({ success: false, response: e.message });
  }
});


// @desc    Retrieve Existing User Profile
// @route   GET api/users/:userId
// @access  Private

export const getUserProfileController = asyncHandler(async (req, res) => {
  const userId = req.params.userId;

  try {
    // Find a user in the database with the same ID and get the details
    const userToBeDisplayed = await UserModel.findById(userId);

    if (userToBeDisplayed) {
      res.status(200).json({
        success: true,
        response: {
          username: userToBeDisplayed.username,
          password: userToBeDisplayed.password,
          email: userToBeDisplayed.email,
          consent: userToBeDisplayed.consent,
          image: userToBeDisplayed.image,
          location: userToBeDisplayed.location,
          introduction: userToBeDisplayed.introduction,
          products: userToBeDisplayed.products
        }
      });
    } else {
      res.status(400).json({
        success: false,
        response: "User not found"
      });
    }
  } catch (e) {
    res.status(500).json({ success: false, response: e.message });
  }
});


// @desc    Update Existing User Profile - update existing info (except for username) or add new info such as self-introduction, location, profile picture
// @route   PUT api/users/:userId
// @access  Private

export const updateUserController = asyncHandler(async (req, res) => {
  const userId = req.params.userId;
  // Log the userId to check if it's correctly extracted
  console.log("userId:", userId);
  // const { password, email, location, introduction, products } = req.body;
  const { password, email, location, introduction } = req.body;

  let userToBeUpdated; 
  
  try {
    // Ensure that the username is not included in the update
    if ("username" in req.body) {
      res.status(400).json({
        success: false,
        response: "Username cannot be updated",
      });
      return;
    }

    // Check if the current user is using a new email or password that matches with the same email or password in the database, so they would have to choose something diferent
    // Find a user with the provided username in the database
    const user = await UserModel.findById(userId);
    if (!user) {
      // If no user is found with the provided username, respond with a 401 Unauthorized and a user not found message
      return res
        .status(401)
        .json({ success: false, response: "User not found" });
    }
    console.log(user);
    // if (existingUser) {
    //   res.status(400);
    //   throw new Error(
    //     `${existingUser.password === hashedPassword ? "Password" : "Email"
    //     } already exists`
    //   );
    // }

    if (email && email === user.email) {
      return res
      .status(500)
      .json({ success: false, response: "Email already exists" });
    };
    

    if (password) {
      // Compare the provided password with the hashed password in the database
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        // If the provided password doesn't match the stored password, respond with 500 and a message that password already exists
          return res
          .status(500)
          .json({ success: false, response: "Password already exists" });
      } else {
        const salt = bcrypt.genSaltSync(10);
        req.body.password = bcrypt.hashSync(password, salt);
      };
    };
    // Generate a salt and hash the user's password
    // In this line below, we're using the bcrypt library to create a random value called "salt." The salt is added to the password before hashing it. It adds an extra layer of security by making it more difficult for attackers to use precomputed tables (rainbow tables) to crack passwords. The 10 in genSaltSync(10) represents the cost factor, which determines how computationally intensive the hashing process will be.
    // const salt = bcrypt.genSaltSync(10);

    // const hashedPassword = bcrypt.hashSync(password, salt);

    // Find a user in the database with the same ID and update the details
    userToBeUpdated = await UserModel.findByIdAndUpdate(userId, {
      $set: {
        // password: hashedPassword, // doublecheck how to display password in frontend
        password: req.body.password,
        email: req.body.email,
        location: req.body.location,
        introduction: req.body.introduction
        // products: products
      }
    }, {
      new: true // add this to return the updated
    });

    if (userToBeUpdated) {
      res.status(200).json({
        success: true,
        response: userToBeUpdated
      });
    } else {
      res.status(400).json({
        success: false,
        response: "User not found"
      });
    }
  } catch (e) {
    res.status(500).json({ success: false, response: e.message });
  };
});

// @desc    Update User Image - update or add a new image to an existing user profile
// @route   PUT api/update-image/:userId
// @access  Private
export const updateImageController = asyncHandler(async (req, res) => {
  const userId = req.params.userId;

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        response: 'No image file provided',
      });
    };

    // Upload image to Cloudinary if there is one in request
    const result = await cloudinary.uploader.upload(req.file.path);

    // Save the Cloudinary URL and image ID in the user's record
    const userToBeUpdated = await UserModel.findByIdAndUpdate(userId, {
      $set: {
        image: result.url,
        imageId: result.public_id,
      },
    }, {
      new: true
    });

    if (userToBeUpdated) {
      res.status(200).json({
        success: true,
        response: userToBeUpdated
      });
    } else {
      res.status(400).json({
        success: false,
        response: "User not found"
      });
    }
  } catch (error) {
    console.error('Image Upload Error:', error);
    return res.status(500).json({
      success: false,
      response: 'Error uploading image to Cloudinary.',
      error: error.message,
    });
  }
});


// @desc    Delete Existing User and their Ads
// @route   DELETE api/users/:userId
// @access  Private
export const deleteUserController = asyncHandler(async (req, res) => {
  const userId = req.params.userId;

  try {
    const userToBeDeleted = await UserModel.findById(userId);
    if (!userToBeDeleted) {
      return res.status(400).json({
        success: false,
        response: "User not found"
      });
    }

    // Remove user ID from savedBy array in all ads
    await AdModel.updateMany(
      { savedBy: userId },
      { $pull: { savedBy: userId } }
    );

    // Delete all ads created by this user
    const adsToDelete = await AdModel.find({ user: userId });
    for (const ad of adsToDelete) {
      if (ad.imageId) {
        await cloudinary.uploader.destroy(ad.imageId);
      }
    }
    await AdModel.deleteMany({ user: userId });

    // Delete the user's image from Cloudinary, if applicable
    if (userToBeDeleted.imageId) {
      await cloudinary.uploader.destroy(userToBeDeleted.imageId);
    }

    // Delete the user from the database
    await UserModel.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,
      response: {
        message: `User with ID ${userId} and their ads deleted successfully`,
        deletedUser: userToBeDeleted
      }
    });
  } catch (e) {
    res.status(500).json({ success: false, response: e.message });
  };
});
