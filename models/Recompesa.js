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
    },
    fechaInicio: { // Columna para la fecha de inicio
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    fechaFin: { // Columna para la fecha de finalización
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    puntaje:{
        type:DataTypes.INTEGER,
    }
},{
    freezeTableName:true,
});




Usuario.hasMany(Recompesa,{
    foreignKey:"idUsuario"
})

Recompesa.belongsTo(Usuario,{
    foreignKey:"idUsuario"
})
