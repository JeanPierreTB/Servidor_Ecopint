import { DataTypes } from "sequelize";
import { sequelize } from "../database/database.js";
import { Usuario } from "./Usuario.js";

export const Notifiacion=sequelize.define("Notifiacion",{
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
    },
    nombre:{
        type:DataTypes.STRING
    },
    foto:{
        type:DataTypes.TEXT
    }
},{
    freezeTableName:true
})

Usuario.hasMany(Notifiacion,{
    foreignKey:'idUsuario'
})

Notifiacion.belongsTo(Usuario,{
    foreignKey:'idUsuario'
})