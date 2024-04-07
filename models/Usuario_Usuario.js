import { sequelize } from "../database/database.js";
import { DataTypes } from "sequelize";
import { Usuario } from "./Usuario.js";
import { Comentario } from "./Comentario.js";


export const  Usuario_Usuario= sequelize.define(
  "Usuario_Usuario",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    fecha:{
      type:DataTypes.DATEONLY,
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

  Usuario.hasMany(Comentario,{
    foreignKey:'idamigo'
  })

  Comentario.belongsTo(Usuario_Usuario,{
    foreignKey:'idamigo'
  })
  