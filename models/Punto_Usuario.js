import { sequelize } from "../database/database.js";
import { DataTypes } from "sequelize";
import { Punto } from "./Punto.js";
import { Usuario } from "./Usuario.js";

export const Punto_Usuario = sequelize.define(
  "Punto_Usuario",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    realizado:{
      type:DataTypes.BOOLEAN
    },
    fecha:{
      type:DataTypes.DATEONLY,
    },
    cantidad:{
      type:DataTypes.INTEGER
    }
  },
  {
    freezeTableName: true,
    timestamps: false,
  }
);

Usuario.belongsToMany(Punto, { through: Punto_Usuario });
Punto.belongsToMany(Usuario, { through: Punto_Usuario });
