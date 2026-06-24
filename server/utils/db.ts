import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const dbUrl: string = process.env.MONGO_URI || "";

if (!dbUrl) {
  throw new Error("db url not found");
}

const connectDB = async (): Promise<void> => {
  try {
    const data = await mongoose.connect(dbUrl);

    console.log(
      `MongoDB connected with server: ${data.connection.host}`
    );
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("MongoDB connection error:", error.message);
    } else {
      console.error("MongoDB connection error:", error);
    }

    process.exit(1);
  }
};

export default connectDB;