import { DataTypes } from "sequelize";
import { sequelize } from "../database/database.js";


export const Usuario=sequelize.define("Usuario",{
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    nombre:{
        type:DataTypes.STRING,
    },
    contrasena:{
        type:DataTypes.STRING,
    },
    dni:{
        type:DataTypes.INTEGER,
    },
    ntelefono:{
        type:DataTypes.INTEGER,
    }
},{
    freezeTableName:true
});

