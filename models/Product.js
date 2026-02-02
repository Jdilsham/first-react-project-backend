import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Product = sequelize.define(
  "Product",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    productID: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    category: {
      type: DataTypes.STRING,
    },

    description: {
      type: DataTypes.TEXT,
    },

    price: {
      type: DataTypes.DOUBLE,
    },

    labeledPrice: {
      type: DataTypes.DOUBLE,
    },

    images: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
    },

    altNames: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
    },
  },
  {
    tableName: "products",
    timestamps: true,
  }
);

module.exports = Product;
