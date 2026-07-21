import { generateToken, findOrCreateGoogleUser, getUserById } from "../services/AuthService.js";
import { OAuth2Client } from "google-auth-library";

class AuthController {
  constructor() {
    this.oauth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.FRONTEND_URL}/auth/callback`
    );
  }

  async verifyGoogleToken(req, res) {
    try {
      const { token } = req.body;

      const ticket = await this.oauth2Client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();

      const user = await findOrCreateGoogleUser(
        payload.sub,
        payload.email,
        payload.name,
        payload.picture
      );

      const jwtToken = generateToken(user._id.toString());

      res.json({
        success: true,
        token: jwtToken,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          isPremium: user.isPremium,
        },
      });
    } catch (error) {
      console.error("Google token verification error:", error.message);

      res.status(401).json({
        success: false,
        error: "Invalid token",
      });
    }
  }

  async getUser(req, res) {
    try {
      const user = await getUserById(req.userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: "User not found",
        });
      }

      res.json({
        success: true,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          isPremium: user.isPremium,
        },
      });
    } catch (error) {
      console.error("Get user error:", error.message);

      res.status(500).json({
        success: false,
        error: "Failed to get user",
      });
    }
  }
}

const authController = new AuthController();

export const verifyGoogleToken = authController.verifyGoogleToken.bind(authController);
export const getUser = authController.getUser.bind(authController);
export default authController;