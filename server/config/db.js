import mongoose from "mongoose";

class DatabaseConnection {
  async connect() {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log("MongoDB Connected");
    } catch (err) {
      console.log(err);
      process.exit(1);
    }
  }
}

const databaseConnection = new DatabaseConnection();

export default databaseConnection.connect.bind(databaseConnection);