import express from "express";
import { sequelize } from "./database/database.js";
import { Usuario } from "./models/Usuario.js";
import cors from "cors";

const app = express();
const port = 3001;
app.use(cors());


const verificarconexion = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    console.log("Conexion a base de datos exitosa");
  } catch (e) {
    console.error("No se logró conectar ", e);
  }
};

app.use(express.json());

app.post("/insertar-usuario", async (req, res) => {
  const {nombre,contrasena,dni,telefono}=req.body
  try {
    const userinfo = await Usuario.create({
      nombre: nombre,
      contrasena: contrasena,
      dni: dni,
      ntelefono: telefono
    });

    res.status(201).send({mensaje:"Usuario creado",res:true});
  } catch (e) {
    console.error("Error al insertar el usuario: ", e);
    res.status(500).send({mensaje:"Error interno en el servidor",res:false});
  }
});

app.post("/verificar-usuario", async (req, res) => {
  try {
    const { nombre, contrasena } = req.body;

    const usuario = await Usuario.findOne({
      where: {
        nombre: nombre,
        contrasena: contrasena,
      },
    });

    if (usuario) {
      res.status(200).json({ mensaje: "Usuario verificado correctamente",res:true});
    } else {
      res.status(401).json({ mensaje: "Nombre de usuario o contraseña incorrectos",res:false });
    }
  } catch (e) {
    console.error("Error al verificar el usuario: ", e);
    res.status(500).json({ mensaje: "Error interno del servidor",res:false});
  }
});



  app.post('/cambio_contra', async (req, res) => {
    try {
        const { nombre, contrasena } = req.body;
        const usuario = await Usuario.update({
            contrasena: contrasena
        }, {
            where: {
                nombre: nombre
            }
        })

        if (usuario[0] === 0) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado',res:false});
        }

        res.status(200).json({ mensaje: 'Contraseña actualizada exitosamente',res:true});
    } catch (e) {
        console.error(e); 
        res.status(500).json({ mensaje: 'Error interno del servidor',res:false});
    }
});


app.get('/',(req,res)=>{
  res.send("Hello world")
})

  
  

app.listen(port, () => {
  console.log(`Servidor ejecutándose en puerto ${port}`);
  verificarconexion();
});
