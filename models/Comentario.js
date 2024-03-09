import { DataTypes } from "sequelize";
import { sequelize } from "../database/database.js";
import { Usuario } from "./Usuario.js";

export const Comentario=sequelize.define("Comentario",{
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    des:{
        type:DataTypes.TEXT
    },
    tipo:{
        type:DataTypes.INTEGER
    }
},{
    freezeTableName:true
})

Usuario.hasMany(Comentario,{
    foreignKey:'idUsuario'
})

Comentario.belongsTo(Usuario,{
    foreignKey:'idUsuario'
})