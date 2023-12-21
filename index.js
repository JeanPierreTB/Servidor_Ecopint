import express from "express";
import { sequelize } from "./database/database.js";
import { Usuario } from "./models/Usuario.js";

const app = express();
const port = 3001;

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

    res.status(201).send(`Usuario creado ${JSON.stringify(userinfo)}`);
  } catch (e) {
    console.error("Error al insertar el usuario: ", e);
    res.status(500).send("Error interno del servidor");
  }
});

app.post("/verificar-usuario", async (req, res) => {
    try {
      const { nombre, contrasena } = req.body;
  
      const usuario = await Usuario.findOne({
        where: {
          nombre:nombre,
          contrasena:contrasena,
        },
      });
  
      usuario
        ? res.status(200).send("Usuario verificado correctamente")
        : res.status(401).send("Nombre de usuario o contraseña incorrectos");
    } catch (e) {
      console.error("Error al verificar el usuario: ", e);
      res.status(500).send("Error interno del servidor");
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
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.status(200).json({ mensaje: 'Contraseña actualizada exitosamente' });
    } catch (e) {
        console.error(e); 
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

  
  

app.listen(port, () => {
  console.log(`Servidor ejecutándose en puerto ${port}`);
  verificarconexion();
});
