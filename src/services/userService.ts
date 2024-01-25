// Import necessary modules
import { generateToken } from "nodejs_ms_shared_library";
import User, { IUser } from "../models/User";
import { comparePassword, hashPassword } from "../utils/passwordUtils";

// Create a new user
export const createUser = async (userInput: IUser): Promise<IUser> => {
  try {
    // Hash the user's password before storing it
    const hashedPassword = await hashPassword(userInput.password);

    // Create the user with the hashed password
    const newUser = await User.create({
      ...userInput,
      password: hashedPassword,
    });

    return newUser;
  } catch (error) {
    throw new Error(`Error creating user: ${error.message}`);
  }
};

// Login user
export const loginUser = async (
  email: string,
  password: string
): Promise<{ user: Omit<IUser, "password">; token: string }> => {
  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("User not found");
    }

    // Compare the provided password with the stored hashed password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Invalid password");
    }

    // Generate JWT token
    const token = generateToken(
      {
        id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
      },
      process.env.JWT_SEC,
      process.env.JWT_EXPIRY_PERIOD
    );

    // Destructure password from the data returned
    const { password: _password, ...userData } = user.toObject();

    return { user: userData as Omit<IUser, "password">, token };
  } catch (error) {
    throw new Error(`Error logging in: ${error.message}`);
  }
};
