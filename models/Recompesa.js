import { DataTypes } from "sequelize";
import { sequelize } from "../database/database.js";
import { Usuario } from "./Usuario.js";


export const Recompesa=sequelize.define("Recompesa",{
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    imagen:{
        type:DataTypes.STRING,
    },
    des:{
        type:DataTypes.STRING,
    }
},{
    freezeTableName:true
});




Usuario.hasMany(Recompesa,{
    foreignKey:"idUsuario"
})

Recompesa.belongsTo(Usuario,{
    foreignKey:"idUsuario"
})
