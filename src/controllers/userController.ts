import { Request, Response } from "express";
import * as UserService from "../services/userService";
import { publishToRabbitMQ } from "nodejs_ms_shared_library";

// Create a new user
export const createUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const newUser = await UserService.createUser(req.body);

    // Publish a "UserRegistered" event to RabbitMQ
    const userRegisteredEvent = {
      userId: newUser._id, // Assuming you have the user's ID in the model
      username: newUser.username,
      email: newUser.email,
      // ... other relevant user data ...
    };

    // Use the RabbitMQ publishing function
    await publishToRabbitMQ(
      "your_exchange",
      "UserRegistered",
      JSON.stringify(userRegisteredEvent),
      {
        host: "your_rabbitmq_host",
        port: 5672, // Update with your RabbitMQ port
        username: "your_rabbitmq_username",
        password: "your_rabbitmq_password",
      }
    );

    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Login user
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  try {
    const { user, token } = await UserService.loginUser(email, password);
    res.status(200).json({ user, token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};
