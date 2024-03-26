import { sequelize } from "../database/database.js";
import { DataTypes } from "sequelize";
import { Usuario } from "./Usuario.js";
import { Objetivo } from "./Objetivo.js";

export const  Objetivo_Usuario= sequelize.define(
  "Objetivo_Usuario",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    porcentaje:{
        type:DataTypes.INTEGER,
        defaultValue:0
    }
  },
  {
    freezeTableName: true,
    timestamps: false,
  }
);

Usuario.belongsToMany(Objetivo,{through:Objetivo_Usuario})
Objetivo.belongsToMany(Usuario,{through:Objetivo_Usuario})