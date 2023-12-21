import { Sequelize } from "sequelize";

export const sequelize=new Sequelize("dbecopoint","postgres","postgre",{
    host:"localhost",
    dialect:"postgres"
})