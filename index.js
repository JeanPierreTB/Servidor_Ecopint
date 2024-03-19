import express from "express";
import { Sequelize, Op } from "sequelize";
import { sequelize } from "./database/database.js";
import { Usuario } from "./models/Usuario.js";
import { Punto } from "./models/Punto.js";
import { Punto_Usuario} from "./models/Punto_Usuario.js";
import { Consejos } from "./models/Consejos.js";
import { Comentario } from "./models/Comentario.js";
import { Objetivo } from "./models/Objetivo.js";
import { Objetivo_Usuario } from "./models/Objetivo_Usuario.js";
import { Recompesa } from "./models/Recompesa.js";
import cors from "cors";
import qrcode from 'qrcode';


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
  const {nombre,contrasena,dni,ntelefono}=req.body
  console.log("body:",req.body)
  try {
    const userinfo = await Usuario.create({
      nombre: nombre,
      contrasena: contrasena,
      dni: dni,
      ntelefono: ntelefono
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
      res.status(200).json({ mensaje: "Usuario verificado correctamente",res:true,usuario:usuario});
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

app.post('/agregar-punto', async (req, res) => {
  try {
    const { latitud, longitud, lugar, puntos } = req.body;

    // Generar el código QR con la información del punto
    const qrCodeData = JSON.stringify({
      latitud: latitud,
      longitud: longitud,
      lugar: lugar,
      puntos: puntos
    });

    // Crear el código QR y obtener su representación en base64
    const qrCodeBase64 = await qrcode.toDataURL(qrCodeData);

    // Crear el punto con el código QR generado
    const newpunto = await Punto.create({
      latitud: latitud,
      longitud: longitud,
      lugar: lugar,
      puntos: puntos,
      codigoqr: qrCodeBase64
    });

    res.status(201).send({
      mensaje: 'Punto creado',
      res: true,
      qrCodeBase64: qrCodeBase64 // Devolver la representación base64 del código QR generado
    });
  } catch (e) {
    console.error('Error al crear punto: ', e);
    res.status(500).send({ mensaje: 'Error interno en el servidor', res: false });
  }
});


app.get('/obtener-puntos',async(req,res)=>{
  try{
    const Allpunto=await Punto.findAll({})

    res.status(200).send({ mensaje: "Puntos obtenidos correctamente", puntos: Allpunto, success: true });

  }catch(e){
    console.error("Error al obtener punto: ",e );
    res.status(500).send({mensaje:"Error interno en el servidor",res:false})
  }
})


app.post('/realizar-punto', async (req, res) => {
  try {
    // Buscar el punto
    const punto = await Punto.findOne({
      where: {
        id: req.body.id
      }
    });

    if (!punto) {
      return res.status(404).send({ mensaje: "Punto no encontrado", res: false });
    }

    // Buscar el usuario
    /*const usuario = await Usuario.findOne({
      where: {
        id:req.body.idu
      }
    });

    if (!usuario) {
      return res.status(404).send({ mensaje: "Usuario no encontrado", res: false });
    }*/

    // Crear el usuario_punto de manera asincrónica
    await Punto_Usuario.create({
      UsuarioId: req.body.idu,
      PuntoId: punto.id
    });

    res.status(200).send({ mensaje: "Operación exitosa", res: true });
  } catch (e) {
    console.error("Error al realizar la operación: ", e);
    res.status(500).send({ mensaje: "Error interno en el servidor", res: false });
  }
});

app.get('/obtener-punto-realizar', async (req, res) => {
  try {
    // Obtener todos los registros de Punto_Usuario
    const puntosUsuario = await Punto_Usuario.findAll({});

    // Obtener un array con los PuntoId
    const puntoIds = puntosUsuario.map(puntoUsuario => puntoUsuario.PuntoId);

    // Consultar todos los registros de Punto con los PuntoId obtenidos
    const puntos = await Punto.findAll({
      where: {
        id: {
          [Sequelize.Op.in]: puntoIds
        }
      }
    });

    res.status(200).send({ mensaje: "Operación exitosa", res: true, puntos });

  } catch (e) {
    console.error("Error al realizar la operación: ", e);
    res.status(500).send({ mensaje: "Error interno en el servidor", res: false });
  }
});


app.post('/punto-realizado',async(req,res)=>{
  try{
    console.log("body:",req.body)
    const punto=await Punto.findOne({
      where:{
        lugar:req.body.lugar
      }
    })
    if(!punto){
      return res.status(404).send({ mensaje: "Punto no encontrado", res: false });
    }

    const usuario=await Usuario.findOne({
      where:{
        id:req.body.id
      }
    })

    if(!usuario){
      return res.status(404).send({ mensaje: "Usuario no encontrado", res: false });
    }


    const usuarioActualizado = await Usuario.update(
      { 
        puntaje: usuario.puntaje + punto.puntos,
        puntosrecilados:usuario.puntosrecilados+1
      
      },
      {
        where: {
          id:req.body.id
        }
      }
    );
    

    if(!usuarioActualizado){
      return res.status(404).send({ mensaje: "Usuario no encontrado", res: false });
    }





    

    const Punto_Usuario1=await Punto_Usuario.destroy({
      where:{
        PuntoId:punto.id,
      }
    })

    

    res.status(200).send({ mensaje: "Punto realizado", res: true,punto:punto });


  }catch(e){
    console.error("Error al realizar la operación: ", e);
    res.status(500).send({ mensaje: "Error interno en el servidor", res: false });
  }
})



app.post('/terminar-punto', async (req, res) => {
  try {
    const puntoUsuario = await Punto_Usuario.destroy({
      where: {
        id: req.body.id
      }
    });

    if (!puntoUsuario) {
      return res.status(404).send({ mensaje: "Punto de usuario no encontrado", res: false });
    }

    // Realiza las acciones necesarias para "terminar" el punto de usuario aquí

    // Agrega un mensaje de éxito si es apropiado
    res.status(200).send({ mensaje: "Operación exitosa", res: true });
  } catch (e) {
    console.error("Error al realizar la operación: ", e);
    res.status(500).send({ mensaje: "Error interno en el servidor", res: false });
  }
});


app.post('/agregar-consejo',async(req,res)=>{
  try{
    const consejo=await Consejos.create({
      des:req.body.des,
      dia:req.body.dia
    })
    res.status(201).send({mensaje:"Consejo creado",res:true});

  }catch(e){
    console.error("Error al realizar la operación: ", e);
    res.status(500).send({ mensaje: "Error interno en el servidor", res: false });
  }
})

app.get('/recuperar-consejos',async(req,res)=>{
  try{
    const diaactual=new Date().getDay() || 7;
    const consejoshoy=await Consejos.findAll({
      where:{
        dia:diaactual
      }
    })
    if(!consejoshoy){
      return res.status(404).send({ mensaje: "Consejo no encontrado", res: false });
    }

    res.status(200).send({ mensaje: "Consejos encontrados", res: true,consejos:consejoshoy });

  }catch(e){
    console.error("Error al realizar la operación: ", e);
    res.status(500).send({ mensaje: "Error interno en el servidor", res: false });
  }
})



app.post('/realizar-comentario',async(req,res)=>{
  try{

    /*const usuarioc=await Usuario.findOne({
      where:{
        id:req.body.id
      }
    })

    if(!usuarioc){
      return res.status(404).send({ mensaje: "Punto no encontrado", res: false });
    }*/

    const nuevocomentario=await Comentario.create({
      des:req.body.des,
      tipo:req.body.tipo,
      idUsuario:req.body.id
    })
    res.status(201).send({mensaje:"Comentario creado",res:true});

  }catch(e){
    console.error("Error al realizar la operación: ", e);
    res.status(500).send({ mensaje: "Error interno en el servidor", res: false });
  }
})


app.get('/obtener-comentarios', async (req, res) => {
  try {
    // Obtén la fecha actual
    const fechaHoy = new Date();
    fechaHoy.setHours(0, 0, 0, 0);  // Establece la hora a las 00:00:00:000 para obtener los comentarios de todo el día

    // Realiza la consulta para obtener los comentarios del día de hoy
    const comentariosHoy = await Comentario.findAll({
      where: {
        createdAt: {
          [Op.gte]: fechaHoy,
        },
      },
      include:[
        {
          model:Usuario
        }
      ]
    });

    res.status(200).send({ comentarios: comentariosHoy, res: true });
  } catch (e) {
    console.error("Error al realizar la operación: ", e);
    res.status(500).send({ mensaje: "Error interno en el servidor", res: false });
  }
});


app.post('/agregar-objetivo',async(req,res)=>{
  try{
    const objetivo=await Objetivo.create({
      des:req.body.des,
      puntos:req.body.puntos,
      dia:req.body.dia
    })
    res.status(201).send({mensaje:"Objetivo creado",res:true});

  }catch(e){
    console.error("Error al realizar la operación: ", e);
    res.status(500).send({ mensaje: "Error interno en el servidor", res: false });
  }
})

app.get('/recuperar-objetivo',async(req,res)=>{
  try{
    const diaactual=new Date().getDay() || 7;
    const objetivo=await Objetivo.findAll({
      where:{
        dia:diaactual
      }
    })
    if(!objetivo){
      return res.status(404).send({ mensaje: "Objetivos no encontrados", res: false });
    }

    res.status(200).send({ mensaje: "Objetivos encontrados", res: true,objetivo:objetivo });

  }catch(e){
    console.error("Error al realizar la operación: ", e);
    res.status(500).send({ mensaje: "Error interno en el servidor", res: false });
  }
})


app.post('/obtener-usuario',async(req,res)=>{
  try{
    const usuario=await Usuario.findOne({
      where:{
        id:req.body.id
      }
    })

    if(!usuario){
      return res.status(404).send({ mensaje: "Usuario no encontrado", res: false });
    }

    res.status(200).send({ mensaje: "Usuario encontrado", res: true,usuario:usuario });
  }catch(e){
    console.error("Error al realizar la operación: ", e);
    res.status(500).send({ mensaje: "Error interno en el servidor", res: false });
  }
})


app.post('/notas-usuario',async(req,res)=>{
  try{
    const usuario=await Usuario.findOne({
      where:{
        id:req.body.id
      }
    })

    if(!usuario){
      return res.status(404).send({ mensaje: "Usuario no encontrado", res: false });
    }

    console.log(usuario)


    /*const puntosreciclados=await Punto_Usuario.count({
      where:{
        UsuarioId:usuario.id
      }
    })*/

    /*const objetivoscumplidos=await Objetivo_Usuario.count({
      where:{
        UsuarioId:usuario.id,
      }
    })*/



    const recompesaobtenidas=await Recompesa.count({
      where:{
        idUsuario:req.body.id,
      }
    })

    const usuarios=await Usuario.findAll({
      order:[['puntaje','DESC']]
    })

    const poscionusuario=usuarios.findIndex(usuario=>(usuario.id===req.body.id))



    res.status(200).send({ mensaje: "Campos encontrados", res: true,puntosreciclados:usuario.puntosrecilados,puntaje:usuario.puntaje,recompesaobtenidas:recompesaobtenidas,usuarios:(poscionusuario+1)});







  }catch(e){
    console.error("Error al realizar la operación: ", e);
    res.status(500).send({ mensaje: "Error interno en el servidor", res: false });
  }
})


app.post('/actualizar-foto', async (req, res) => {
  try {
      const usuario = await Usuario.update(
          { foto: req.body.foto },
          {
              where: {
                 id:req.body.id
              }
          }
      );

      if (usuario[0] === 0) {
          return res.status(404).send({ mensaje: "Usuario no encontrado", res: false });
      }

      res.status(200).send({ mensaje: "Usuario actualizado", res: true, usuario: usuario });

  } catch (e) {
      console.error("Error al realizar la operación: ", e);
      res.status(500).send({ mensaje: "Error interno en el servidor", res: false });
  }
});


app.post('/actualizar-datos-usuario', async (req, res) => {
  try {
    // Actualiza los datos del usuario en la base de datos
    const usuario = await Usuario.update({
      nombre: req.body.nombre,
      contrasena: req.body.contrasena, // Corregí la escritura de "contrasena"
      dni: req.body.dni,
      ntelefono: req.body.ntelefono,
    }, {
      where: {
        id: req.body.id
      }
    });

    // Verifica si se actualizó correctamente
    if (usuario[0] === 1) {
      // Si se actualizó correctamente, envía una respuesta exitosa
      res.status(200).send({ mensaje: "Datos de usuario actualizados correctamente", res: true });
    } else {
      // Si no se actualizó (porque el usuario no existe), envía un mensaje de error
      res.status(404).send({ mensaje: "El usuario no existe", res: false });
    }
  } catch (e) {
    // Si ocurre algún error durante la operación, maneja la excepción
    console.error("Error al realizar la operación: ", e);
    res.status(500).send({ mensaje: "Error interno en el servidor", res: false });
  }
});


app.get('/rankings-usuarios',async(req,res)=>{
  try{
    const usuarios=await Usuario.findAll({
      order:[['puntaje','DESC']]
    })


    res.status(200).send({ mensaje: "Rankings de usuarios", res: true,usuarios:usuarios});


  }catch(e){
    console.error("Error al realizar la operación: ", e);
    res.status(500).send({ mensaje: "Error interno en el servidor", res: false });
  }
})






app.get('/',(req,res)=>{
  res.send("Hello world")
})

  

app.listen(port, () => {
  console.log(`Servidor ejecutándose en puerto ${port}`);
  verificarconexion();
});
