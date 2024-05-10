import express from "express";
import { Sequelize, Op, where } from "sequelize";
import { sequelize } from "./database/database.js";
import { Usuario } from "./models/Usuario.js";
import { Punto } from "./models/Punto.js";
import { Punto_Usuario} from "./models/Punto_Usuario.js";
import { Consejos } from "./models/Consejos.js";
import { Comentario } from "./models/Comentario.js";
import { Objetivo } from "./models/Objetivo.js";
import { Objetivo_Usuario } from "./models/Objetivo_Usuario.js";
import { Recompesa } from "./models/Recompesa.js";
import { Usuario_Usuario } from "./models/Usuario_Usuario.js";
import { Notifiacion } from "./models/Notificacion.js";
import moment from 'moment';
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

const verificardia= async()=>{
  try{

    const fechaHoy = new Date();
    const fechaAyer = new Date(fechaHoy);
    fechaAyer.setDate(fechaHoy.getDate() - 1);

// Extraer la parte de fecha de la fecha de ayer
    const fechaAyerSinHora = fechaAyer.toISOString().split('T')[0];

    console.log(fechaAyerSinHora);

    const recompesa=await Recompesa.findOne({
      where:{
        fechaFin:fechaAyerSinHora
      }
    })

    if(recompesa){
      const usuarios=await Usuario.update(
        {puntaje:0},{where:{}})
      const objetivos=await Objetivo_Usuario.update(
        {porcentaje:0},{where:{}})
       return console.log("Recompesa obtenido",recompesa);
    }

    return

    
  }catch(e){
    console.error("No se pudo saber el dia",e)
  }
}

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

    const objetivos=await Objetivo.findAll({})

    const registrosObjetivoUsuario = objetivos.map(objetivo => ({
      UsuarioId: userinfo.id,
      ObjetivoId: objetivo.id,
    }));

    await Objetivo_Usuario.bulkCreate(registrosObjetivoUsuario);

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


app.post("/usuario-existente",async(req,res)=>{
  try{
    const usuario=await Usuario.findOne({
      where:{
        nombre:req.body.nombre
      }
    })
    if(usuario){
      res.status(200).json({ mensaje: "Usuario existe",res:true,usuario:usuario});

    }else{
      res.status(401).json({ mensaje: "Usuario no existe",res:false });

    }
  }catch(e){
    console.error("Error al verificar el usuario: ", e);
    res.status(500).json({ mensaje: "Error interno del servidor",res:false});
  }
})



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
    const { latitud, longitud, lugar,tipo } = req.body;

    // Generar el código QR con la información del punto
    const qrCodeData = JSON.stringify({
      latitud: latitud,
      longitud: longitud,
      lugar: lugar,
      tipo:tipo
    });

    // Crear el código QR y obtener su representación en base64
    const qrCodeBase64 = await qrcode.toDataURL(qrCodeData);

    // Crear el punto con el código QR generado
    const newpunto = await Punto.create({
      latitud: latitud,
      longitud: longitud,
      lugar: lugar,
      codigoqr: qrCodeBase64,
      tipo:tipo
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
      PuntoId: punto.id,
      realizado:false,
      cantidad:0
    });

    res.status(200).send({ mensaje: "Operación exitosa", res: true });
  } catch (e) {
    console.error("Error al realizar la operación: ", e);
    res.status(500).send({ mensaje: "Error interno en el servidor", res: false });
  }
});

app.post('/obtener-punto-realizar', async (req, res) => {
  try {
    // Obtener todos los registros de Punto_Usuario
    const puntosUsuario = await Punto_Usuario.findAll({
      where:{
        realizado:false,
        UsuarioId:req.body.usuario
      }
    });

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


app.post('/punto-cancelado-qr',async(req,res)=>{
  try{

    if(req.body.lugarseleccionado===req.body.lugar){
      const punto=await Punto.findOne({
        where:{
          latitud:req.body.latitud,
          longitud:req.body.longitud,
          lugar:req.body.lugar,
          tipo:req.body.tipo
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

      const cantidad=req.body.cantidad;
      const usuariop=usuario.puntaje;
      let puntajenuevo;

      switch(punto.tipo){
        case "Papel":
          puntajenuevo=usuariop+(cantidad*3);
          break;
        case "Plástico":
          puntajenuevo=usuariop+(cantidad*3);
          break;
        case "Metal":
          puntajenuevo=usuariop+(cantidad*3);
          break;
        case "Baterias":
          puntajenuevo=usuariop+(cantidad*2);
          break;
        case "Ropa":
          puntajenuevo=usuariop+(cantidad*4)
          break;

      }
  
  
      const usuarioActualizado = await Usuario.update(
        { 
          puntaje: puntajenuevo
        
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

      const fechaHoy = new Date();
      const fechaHoySinHora = fechaHoy.toISOString().split('T')[0];

      const Punto_Usuario1=await Punto_Usuario.update(
        { 
          realizado:true,
          PuntoId:null,
          fecha:fechaHoySinHora,
          cantidad:req.body.cantidad
        
        },
        {
          where: {
            PuntoId:punto.id,
          }
        }
        
        
        
      )

      /*where:{
          PuntoId:punto.id,
        } */
  

      res.status(200).send({ mensaje: "Punto Realizado", res: true,punto:punto });

    }

    else{
      return res.status(404).send({ mensaje: "Lugares no coinciden", res: false });
    }
    


  }catch(e){
    console.error("Error al realizar la operación: ", e);
    res.status(500).send({ mensaje: "Error interno en el servidor", res: false });
  }
})


app.post('/punto-cancelado',async(req,res)=>{
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

    const Punto_Usuario1=await Punto_Usuario.destroy({
      where:{
        PuntoId:punto.id,
      }
    })

    

    res.status(200).send({ mensaje: "Punto Cancelado", res: true,punto:punto });


    /*const usuario=await Usuario.findOne({
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
    }*/





    

    

  }catch(e){
    console.error("Error al realizar la operación: ", e);
    res.status(500).send({ mensaje: "Error interno en el servidor", res: false });
  }
})






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
    const fechaHoy = new Date();
    const fechaHoySinHora = fechaHoy.toISOString().split('T')[0];

    const nuevocomentario=await Comentario.create({
      des:req.body.des,
      tipo:req.body.tipo,
      idUsuario:req.body.id,
      fecha:fechaHoySinHora
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
    const fechaHoySinHora = fechaHoy.toISOString().split('T')[0];

    // Realiza la consulta para obtener los comentarios del día de hoy
    const comentariosHoy = await Comentario.findAll({
      where: {
        fecha:fechaHoySinHora,
        tipo:{
          [Op.ne]: 4
        }
      },
      include:[
        {
          model:Usuario
        }
      ],
      order: [['id', 'ASC']]
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

app.post('/recuperar-objetivo', async (req, res) => {
  try {
    const diaactual = new Date().getDay() || 7;

    const objetivos = await Objetivo.findAll({
      where: { dia: diaactual },
      include: [
        {
          model: Usuario,
          through: { attributes: ['porcentaje'] },
          where:{id:req.body.id},
          attributes: { exclude: ['contrasena', 'dni', 'ntelefono', 'puntaje', 'foto', 'createdAt', 'updatedAt','nombre'] }, // Excluir los campos que no deseas enviar
          as: 'Usuarios', // Alias para la asociación
        }
      ]
    });

    if (!objetivos || objetivos.length === 0) {
      return res.status(404).send({ mensaje: "Objetivos no encontrados", res: false });
    }

    res.status(200).send({ mensaje: "Objetivos encontrados", res: true, objetivo: objetivos });

  } catch (e) {
    console.error("Error al realizar la operación: ", e);
    res.status(500).send({ mensaje: "Error interno en el servidor", res: false });
  }
});




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


    const puntosreciclados=await Punto_Usuario.count({
      
      where:{
        UsuarioId:usuario.id,
        realizado:true
      }
    })

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



    res.status(200).send({ mensaje: "Campos encontrados", res: true,puntosreciclados:puntosreciclados,puntaje:usuario.puntaje,recompesaobtenidas:recompesaobtenidas,usuarios:(poscionusuario+1)});







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

app.post('/ver-notifiaciones',async(req,res)=>{
  try{
    const noti=await Notifiacion.findAll({
      where:{
        idUsuario:req.body.id
      },
      
    })

    if(!noti){
      return res.status(404).send({ mensaje: "Notificaciones no encontradas", res: false });
    }

    res.status(200).send({ mensaje: "Notificaciones encontradas", res: true,noti:noti });
  }catch(e){
    console.error("Error al realizar la operación: ", e);
    res.status(500).send({ mensaje: "Error interno en el servidor", res: false });
  }
})


app.post('/noti-agregar-amigo',async(req,res)=>{
  try{
    const noti=await Notifiacion.create({
      des:req.body.des,
      tipo:req.body.tipo,
      idUsuario:req.body.idamigo,
      nombre:req.body.nombre,
      foto:req.body.foto
    })

    res.status(200).send({ mensaje: "Notificacion agregada", res: true,noti:noti });

  }catch(e){
    console.error("Error al realizar la operación: ", e);
    res.status(500).send({ mensaje: "Error interno en el servidor", res: false });
  }
})

app.post('/amigo-rechazado',async(req,res)=>{
  try{

    const usuario=await Usuario.findOne({
      where:{
        nombre:req.body.nombre
      }
    })
    const noti=await Notifiacion.destroy({
      where:{
        nombre:req.body.nombre
      }
    })
    

    const noti2=await Notifiacion.create({
      nombre:req.body.nombre1,
      foto:req.body.foto,
      des:req.body.des,
      tipo:req.body.tipo,
      idUsuario:usuario.id,
    })

    res.status(200).send({ mensaje: "Amigo rechazado", res: true });


  }catch(e){
    console.error("Error al realizar la operación: ", e);
    res.status(500).send({ mensaje: "Error interno en el servidor", res: false });
  }
})


app.post('/agregar-amigos',async(req,res)=>{
  try{

    const usuarioi=await Usuario.findOne({
      where:{
        nombre:req.body.nombre
      }
    })

    const fechaHoy = new Date();
    const fechaHoySinHora = fechaHoy.toISOString().split('T')[0];

    const usuario=await Usuario_Usuario.create({
      UsuarioAId:req.body.idusuario,
      UsuarioBId:usuarioi.id,
      fecha:fechaHoySinHora
    })

    /*const usuario1=await Usuario_Usuario.create({
      UsuarioAId:usuarioi.id,
      UsuarioBId:req.body.idusuario
    })*/

    const noti=await Notifiacion.destroy({
      where:{
        nombre:req.body.nombre
      }
    })

    const noti2=await Notifiacion.create({
      nombre:req.body.nombre1,
      foto:req.body.foto,
      des:req.body.des,
      tipo:req.body.tipo,
      idUsuario:usuarioi.id,
    })

    res.status(200).send({ mensaje: "Amigo agregado", res: true,usuario:usuario});



  }catch(e){
    console.error("Error al realizar la operación: ", e);
    res.status(500).send({ mensaje: "Error interno en el servidor", res: false });
  }
})



app.post('/misamigos',async(req,res)=>{
  try{
   
    
    const amigos=await Usuario_Usuario.findAll({
      where:{
        UsuarioAId:req.body.id
      }
    })
    

    if(amigos.length===0){
      
      const amigos2=await Usuario_Usuario.findAll({
        where:{
          UsuarioBId:req.body.id
        }
      })

      const amistades2=amigos2.map(amigo=>amigo.UsuarioAId);
      const amistadesinfo=await Usuario.findAll({
        where:{
          id:{
            [Op.in]:amistades2
          }
        }
      })
      res.status(200).send({ mensaje: "Amigos encontrados", res: true, amigos:amistadesinfo });

      

    }
    else{
      const amistades=amigos.map(amigo=>amigo.UsuarioBId);
      const amistadesinfo=await Usuario.findAll({
        where:{
          id:{
            [Op.in]:amistades
          }
        }
      })

      res.status(200).send({ mensaje: "Amigos encontrados", res: true, amigos:amistadesinfo });



    }

    

    
    


  }catch(e){
    console.error("Error al realizar la operación: ", e);
    res.status(500).send({ mensaje: "Error interno en el servidor", res: false });
  }
})


app.post('/todos-sin-amigos',async(req,res)=>{
  try{
    const usuario=await Usuario_Usuario.findAll({
      where:{
        UsuarioAId:req.body.id
        
      }
    })
    
    //console.log("Usuarion",usuario[0].UsuarioBId)

    const usuario2=await Usuario_Usuario.findAll({
      where:{
        UsuarioBId:req.body.id
      }
    })

    const idsAmigos = usuario.map(user => parseInt(user.UsuarioBId));
    const idsAmigos2 = usuario2.map(user => parseInt(user.UsuarioAId));
    idsAmigos.push(...idsAmigos2);
    idsAmigos.push(parseInt(req.body.id));



    const usuariosNoAmigos = await Usuario.findAll({
      where: {
        id: { 
          [Sequelize.Op.notIn]: idsAmigos
        }
      }
    });

    if(!usuario){
      return res.status(404).send({ mensaje: "Usuarios no encontrado", res: false });
    }

    res.status(200).send({ mensaje: "Usuarios encontrado", res: true,usuario:usuariosNoAmigos });






  }catch(e){
    console.error("Error al realizar la operación: ", e);
    res.status(500).send({ mensaje: "Error interno en el servidor", res: false });
  }
})


app.post('/recuperar-comentariouau',async(req,res)=>{
  try{


      
      
      const comentario=await Comentario.findAll({
        where:{
          idUsuario:req.body.id_usuario,
          idamigo:req.body.id_amigo
        },include:[{model:Usuario}]
      })

      const comentario2=await Comentario.findAll({
        where:{
          idUsuario:req.body.id_amigo,
          idamigo:req.body.id_usuario
        },include:[{model:Usuario}]
      })

      const comentarios=comentario.concat(comentario2)
      const comentariosOrdenados = comentarios.sort((a, b) => a.id - b.id);


      

      res.status(200).send({ mensaje: "info encontrada", res: true,comentarios:comentariosOrdenados });




      
      



      


    

    

    

   



  }catch(e){
    console.error("Error al realizar la operación: ", e);
    res.status(500).send({ mensaje: "Error interno en el servidor", res: false });
  }
})

app.post('/agregar-comentariouau',async(req,res)=>{
  try{

    const fechaHoy = new Date();
    const fechaHoySinHora = fechaHoy.toISOString().split('T')[0];
  
      const comentario=await Comentario.create({
        des:req.body.des,
        tipo:req.body.tipo,
        idUsuario:req.body.id_usuario,
        idamigo:req.body.id_amigo,
        fecha:fechaHoySinHora
      })
    

  
    res.status(200).send({ mensaje: "Comentario creado", res: true });


    
  }catch(e){
    console.error("Error al realizar la operación: ", e);
    res.status(500).send({ mensaje: "Error interno en el servidor", res: false });
  }
})


app.post('/agregar-recompesa',async(req,res)=>{
  try {
    const { imagen, des, fechainicio,fechafin ,puntaje} = req.body;
    const fechaInicio = new Date(fechainicio);
    const fechaFin = new Date(fechafin);

    // Obtener solo la parte de la fecha en formato ISO8601 (YYYY-MM-DD)
    const fechaInicioISO = fechaInicio.toISOString().split('T')[0];
    const fechaFinISO = fechaFin.toISOString().split('T')[0];
    
    const nuevaRecompensa = await Recompesa.create({
      imagen: imagen,
      des: des,
      fechaInicio: fechaInicioISO,
      fechaFin:fechaFinISO,
      puntaje:puntaje
    });

    res.status(201).json({ mensaje: 'Recompensa agregada con éxito', res: true, nuevaRecompensa });
  } catch (e) {
    console.error('Error al agregar recompensa:', e);
    res.status(500).json({ mensaje: 'Error interno en el servidor', res: false });
  }
})

app.get('/obtener-recompesa-semanal',async(req,res)=>{
  try {
    // Obtener la fecha del primer día de la semana actual (lunes)
    const inicioSemana = moment().startOf('isoWeek').subtract(1, 'day');
    // Obtener la fecha del último día de la semana actual (domingo)
    const finSemana = moment().endOf('isoWeek').subtract(1, 'day');

    // Consultar la recompensa que esté dentro de la semana actual
    const recompensa = await Recompesa.findOne({
      where: {
        fechaInicio: {
          [Op.between]: [inicioSemana, finSemana] // Buscar recompensas cuya fecha de inicio esté dentro de la semana actual
        }
      }
    });

    

    if(!recompensa){
      return res.status(200).json({mensaje:"Recompesa no disponible",res:false,recompensa:recompensa})
    }

    res.status(200).json({ mensaje: 'Recompensa semanal obtenida con éxito', res: true, recompensa:recompensa });
  } catch (e) {
    console.error('Error al obtener recompensa semanal:', e);
    res.status(500).json({ mensaje: 'Error interno en el servidor', res: false });
  }
})



app.post('/avance-objetivos-1',async(req,res)=>{
  try{
    
    const fechaHoy = new Date();
    const fechaHoySinHora = fechaHoy.toISOString().split('T')[0];

    const puntosrealizado=await Punto_Usuario.count({
      where:{
        UsuarioId:req.body.id,
        realizado:true,
        fecha:fechaHoySinHora
      }
    })

    const comentarios=await Comentario.count({
      where:{
        idUsuario:req.body.id,
        idamigo:null,
        fecha:fechaHoySinHora
      }
    })

    if(puntosrealizado>0 || comentarios>0){
      await actualizarobjetivos(1,req.body.id,puntosrealizado,3);
      await actualizarobjetivos(2,req.body.id,comentarios,3);
      res.status(200).json({ mensaje: 'Objetivos Actualizados', res: true});

    }
    else{
      res.status(200).json({ mensaje: 'Objetivos no actualizados', res: false});

    }

  }catch(e){
    console.error('Error al obtener recompensa semanal:', e);
    res.status(500).json({ mensaje: 'Error interno en el servidor', res: false });
  }
})


app.post('/avance-objetivos-2',async(req,res)=>{
  try{
    const fechaHoy = new Date();
    const fechaHoySinHora = fechaHoy.toISOString().split('T')[0];

    const puntosrealizado=await Punto_Usuario.count({
      where:{
        UsuarioId:req.body.id,
        realizado:true,
        fecha:fechaHoySinHora
      }
    })

    const comentariosp=await Comentario.count({
      where:{
        idUsuario:req.body.id,
        idamigo:{ [Op.not]: null },
        fecha:fechaHoySinHora
      }
    })

    if(puntosrealizado>0 || comentariosp>0){
      await actualizarobjetivos(3,req.body.id,puntosrealizado,3);
      await actualizarobjetivos(4,req.body.id,comentariosp,1);
      res.status(200).json({ mensaje: 'Objetivos Actualizados', res: true});

    }else{
      res.status(200).json({ mensaje: 'Objetivos no actualizados', res: false});

    }
  }catch(e){
    console.error('Error al obtener recompensa semanal:', e);
    res.status(500).json({ mensaje: 'Error interno en el servidor', res: false });
  }
})


app.post('/avance-objetivos-3',async(req,res)=>{
  try{
    const fechaHoy = new Date();
    const fechaHoySinHora = fechaHoy.toISOString().split('T')[0];

    const puntosrealizado=await Punto_Usuario.count({
      where:{
        UsuarioId:req.body.id,
        realizado:true,
        fecha:fechaHoySinHora
      }
    })

    const comentarios=await Comentario.count({
      where:{
        idusuario:req.body.id,
        idamigo:null,
        fecha:fechaHoySinHora
      }
    })

    if(puntosrealizado>0 || comentarios>0){
      await actualizarobjetivos(5,req.body.id,puntosrealizado,2);
      await actualizarobjetivos(6,req.body.id,comentarios,2);
      res.status(200).json({ mensaje: 'Objetivos Actualizados', res: true});

    }else{
      res.status(200).json({ mensaje: 'Objetivos no actualizados', res: false});

    }
  }catch(e){
    console.error('Error al obtener recompensa semanal:', e);
    res.status(500).json({ mensaje: 'Error interno en el servidor', res: false });
  }
})


app.post('/avance-objetivos-4',async(req,res)=>{
  try{
    const fechaHoy = new Date();
    const fechaHoySinHora = fechaHoy.toISOString().split('T')[0];

    const puntosrealizado=await Punto_Usuario.count({
      where:{
        UsuarioId:req.body.id,
        realizado:true,
        fecha:fechaHoySinHora
      }
    })

    const amigos=await Usuario_Usuario.count({
      where:{
        [Op.or]:[
          {UsuarioAId:req.body.id},
          {UsuarioBId:req.body.id}
        ],fecha:fechaHoySinHora
      }
    })

    if(puntosrealizado>0 || amigos>0){
      await actualizarobjetivos(8,req.body.id,puntosrealizado,6);
      await actualizarobjetivos(9,req.body.id,amigos,3);
      res.status(200).json({ mensaje: 'Objetivos Actualizados', res: true});
    }else{
      res.status(200).json({ mensaje: 'Objetivos no actualizados', res: false});

    }
  }catch(e){
    console.error('Error al obtener recompensa semanal:', e);
    res.status(500).json({ mensaje: 'Error interno en el servidor', res: false });
  }
})


app.post('/avance-objetivos-5',async(req,res)=>{
  try{
    const fechaHoy = new Date();
    const fechaHoySinHora = fechaHoy.toISOString().split('T')[0];

    const puntosrealizado=await Punto_Usuario.count({
      where:{
        UsuarioId:req.body.id,
        realizado:true,
        fecha:fechaHoySinHora
      }
    })

    const comentarios=await Comentario.count({
      where:{
        idUsuario:req.body.id,
        idamigo:null,
        fecha:fechaHoySinHora
      }
    })

    if(puntosrealizado>0 || comentarios>0){
      await actualizarobjetivos(9,req.body.id,puntosrealizado,8);
      await actualizarobjetivos(10,req.body.id,comentarios,3);
      res.status(200).json({ mensaje: 'Objetivos Actualizados', res: true});

    }else{
      res.status(200).json({ mensaje: 'Objetivos no actualizados', res: false});

    }
  }catch(e){
    console.error('Error al obtener recompensa semanal:', e);
    res.status(500).json({ mensaje: 'Error interno en el servidor', res: false });
  }
})






app.post('/avance-objetivos-6',async(req,res)=>{
  try{

    

    const fechaHoy = new Date();
    const fechaHoySinHora = fechaHoy.toISOString().split('T')[0];

    //primer objetivo
    const puntosrealizado=await Punto_Usuario.count({
      where:{
        UsuarioId:req.body.id,
        realizado:true,
        fecha:fechaHoySinHora
      }
    })


    //segundo objetivo
    const amigos=await Usuario_Usuario.count({
      where:{
        [Op.or]:[
          {UsuarioAId:req.body.id},
          {UsuarioBId:req.body.id}
        ],fecha:fechaHoySinHora
      }
    })

    if(puntosrealizado>0 || amigos>0){
      await actualizarobjetivos(11,req.body.id,puntosrealizado,5);
      await actualizarobjetivos(12,req.body.id,amigos,2);
      res.status(200).json({ mensaje: 'Objetivos Actualizados', res: true});
    }
    else{
      res.status(200).json({ mensaje: 'Objetivos no actualizados', res: false});
    }


  

  }catch(e){
    console.error('Error al obtener recompensa semanal:', e);
    res.status(500).json({ mensaje: 'Error interno en el servidor', res: false });
  }
})


app.post('/avance-objetivos-7',async(req,res)=>{
  try{
    

    const fechaHoy = new Date();
    const fechaHoySinHora = fechaHoy.toISOString().split('T')[0];

    const comentarios=await Comentario.count({
      where:{
        idUsuario:req.body.id,
        idamigo:null,
        fecha:fechaHoySinHora
      }
    })

    const puntosrealizados=await Punto_Usuario.count({
      where:{
        UsuarioId:req.body.id,
        realizado:true,
        fecha:fechaHoySinHora
      }
    })

    if(comentarios>0 || puntosrealizados>0){
      await actualizarobjetivos(13,req.body.id,comentarios,2);
      await actualizarobjetivos(14,req.body.id,puntosrealizados,1);

      res.status(200).json({ mensaje: 'Objetivos Actualizados', res: true});
      

    }
    else{
      res.status(200).json({ mensaje: 'Objetivos no actualizados', res: false});
    }

  }catch(e){
    console.error('Error al obtener recompensa semanal:', e);
    res.status(500).json({ mensaje: 'Error interno en el servidor', res: false });
  }
})



app.post('/verificar-recompensa', async (req, res) => {
  try {
      const fechaHoy = new Date();
      const fechaHoySinHora = fechaHoy.toISOString().split('T')[0];
      const usuario = await Usuario.findOne({
          where: {
              id: req.body.id
          }
      });

      const recompensa = await Recompesa.findOne({
          where: {
              fechaInicio: {
                  [Op.lte]: fechaHoySinHora // fechaInicio <= fechaHoySinHora
              },
              fechaFin: {
                  [Op.gte]: fechaHoySinHora // fechaFin >= fechaHoySinHora
              }
          }
      });

      if (recompensa) {
          if (recompensa.idUsuario === req.body.id) {
              return res.status(200).json({ mensaje: 'Recompensa ya obtenida por este usuario', res: true });
          } else if (recompensa.idUsuario !== null) {
              return res.status(200).json({ mensaje: 'Recompensa ya obtenida por otro usuario', res: true});
          } else {
              if (usuario.puntaje >= recompensa.puntaje) {
                  await Recompesa.update({
                      idUsuario: usuario.id
                  }, {
                      where: {
                          id: recompensa.id
                      }
                  });

                  
                  return res.status(200).json({ mensaje: 'Recompensa obtenida', res: true });
              } else {
                  return res.status(200).json({ mensaje: 'Recompensa no obtenida, puntaje insuficiente', res: false });
              }
          }
      } else {
          return res.status(200).json({ mensaje: 'No hay recompensas disponibles', res: false });
      }
  } catch (error) {
      console.error('Error al obtener recompensa semanal:', error);
      return res.status(500).json({ mensaje: 'Error interno en el servidor', res: false });
  }
});


app.post('/actualizar-puntaje', async (req, res) => {
  try {
      const recompesa = await Recompesa.update(
          {
              puntaje: req.body.puntaje
          },
          {
              where: {
                  id: req.body.id
              }
          }
      );

      return res.status(200).json({ mensaje: 'Recompensa Actualizada', res: true, recompesa: recompesa });

  } catch (error) {
      console.error('Error al actualizar puntaje:', error);
      return res.status(500).json({ mensaje: 'Error interno en el servidor', res: false });
  }
});












async function actualizarobjetivos(ObjetivoId, UsuarioId, cantidad, total) {
  let data;

  try {
    data = await Objetivo_Usuario.findOne({
      where: {
        ObjetivoId: ObjetivoId,
        UsuarioId: UsuarioId
      }
    });
  } catch (error) {
    console.error('Error al obtener datos del objetivo del usuario:', error);
    throw error;
  }

  if (data && data.porcentaje === 100) {
    console.log('El objetivo ya está completo.');
    return;
  }

  let res = (cantidad / total) * 100;

  if (res >= 99.9) {
    try {
      const objetivo = await Objetivo.findOne({ where: { id: ObjetivoId } });
      const usuario = await Usuario.findOne({ where: { id: UsuarioId } });

      await Usuario.update({ puntaje: usuario.puntaje + objetivo.puntos }, { where: { id: UsuarioId } });
    } catch (error) {
      console.error('Error al actualizar puntaje:', error);
      throw error;
    }
  }

  try {
    await Objetivo_Usuario.update({ porcentaje: res }, { where: { ObjetivoId: ObjetivoId, UsuarioId: UsuarioId } });
  } catch (error) {
    console.error('Error al actualizar porcentaje:', error);
    throw error;
  }
}









app.get('/',(req,res)=>{
  res.send("Hello world")
})

  

app.listen(port, () => {
  console.log(`Servidor ejecutándose en puerto ${port}`);
  verificarconexion();
  verificardia();
});
