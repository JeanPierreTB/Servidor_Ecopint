import { DataTypes } from "sequelize";
import { sequelize } from "../database/database.js";
import { Usuario } from "./Usuario.js";

export const Consejos=sequelize.define("Consejos",{
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    des:{
        type:DataTypes.TEXT
    },
    dia:{
        type:DataTypes.INTEGER
    }
},{
    freezeTableName:true
})

Usuario.hasMany(Consejos,{
    foreignKey:'idUsuario'
})

Consejos.belongsTo(Usuario,{
    foreignKey:'idUsuario'
})