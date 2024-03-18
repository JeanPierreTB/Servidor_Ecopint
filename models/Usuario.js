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
    },
    puntaje:{
        type:DataTypes.INTEGER,
        defaultValue:0
    },
    puntosrecilados:{
        type:DataTypes.INTEGER,
        defaultValue:0
    },
    foto:{
        type:DataTypes.STRING,
        defaultValue:null
    }
},{
    freezeTableName:true
});

