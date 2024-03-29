import { getConnection } from "../db";
import { DataTypes } from "sequelize";

const connection = getConnection();

const UserModel = connection.define("User", {
  userID: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4, // Generate UUID automatically
    primaryKey: true,
    allowNull: false,
  },
  fullName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  gender: DataTypes.STRING,
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  phone: {
    type: DataTypes.STRING,
    unique: true,
  },
  address: DataTypes.STRING,
  city: DataTypes.STRING,
  state: DataTypes.STRING,
  zip: DataTypes.STRING,
  password: {
    type: DataTypes.TEXT, // Use TEXT for storing hashed passwords
    allowNull: false,
  },
  profileImage: DataTypes.STRING,
  refreshToken: DataTypes.STRING,
  otp: DataTypes.STRING,
  otpVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false, // Default value for boolean fields
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false, // Default value for boolean fields
  },
});

export default UserModel;
