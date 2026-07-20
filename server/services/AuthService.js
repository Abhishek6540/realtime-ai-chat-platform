import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

export const findOrCreateGoogleUser = async (
  googleId,
  email,
  name,
  avatar
) => {
  let user = await User.findOne({ email });

  if (!user) {
    user = new User({
      email,
      name,
      googleId,
      avatar,
    });

    await user.save();
  } else if (!user.googleId) {
    user.googleId = googleId;
    await user.save();
  }

  return user;
};

export const getUserById = async (userId) => {
  return await User.findById(userId);
};