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
    foto:{
        type:DataTypes.STRING,
        defaultValue:'https://static.vecteezy.com/system/resources/previews/027/728/804/non_2x/faceless-businessman-user-profile-icon-business-leader-profile-picture-portrait-user-member-people-icon-in-flat-style-circle-button-with-avatar-photo-silhouette-free-png.png'
    }
},{
    freezeTableName:true
});

