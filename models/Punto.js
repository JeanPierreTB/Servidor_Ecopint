import { DataTypes } from "sequelize";
import { sequelize } from "../database/database.js";

export const Punto=sequelize.define("Punto",{
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    latitud:{
        type:DataTypes.FLOAT
    },
    longitud:{
        type:DataTypes.FLOAT
    },
    lugar:{
        type:DataTypes.STRING
    },
    codigoqr:{
        type:DataTypes.TEXT
    },
    tipo:{
        type:DataTypes.TEXT
    }
},{
    freezeTableName:true
})