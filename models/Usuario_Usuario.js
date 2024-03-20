import { sequelize } from "../database/database.js";
import { DataTypes } from "sequelize";
import { Usuario } from "./Usuario.js";


export const  Usuario_Usuario= sequelize.define(
  "Usuario_Usuario",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    }
  },
  {
    freezeTableName: true,
    timestamps: false,
  }
);

Usuario.belongsToMany(Usuario, {
    through: Usuario_Usuario,
    as: 'UsuariosA',
    foreignKey: 'UsuarioAId'
  });
  
  Usuario.belongsToMany(Usuario, {
    through: Usuario_Usuario,
    as: 'UsuariosB',
    foreignKey: 'UsuarioBId'
  });
  