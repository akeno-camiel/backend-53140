
import jwt from "jsonwebtoken"
import { SECRET, generaHash, validaPassword } from "../utils/utils.js"
import { isValidObjectId } from "mongoose"
import { userService } from "../services/userService.js"
import { TIPOS_ERROR } from "../utils/EErrors.js"
import { CustomError } from "../utils/CustomError.js"
import { logger } from "../utils/Logger.js"
import nodemailer from 'nodemailer'


export class UserController {


    static resetPassword = async (req, res, next) => {
        let { email } = req.body
        logger.info(`Restableciendo contraseña para el usuario: ${email}`)

        try {
            let usuario = await userService.getUsersBy({ email: email })

            let token = jwt.sign({ email: usuario.email, _id: usuario._id }, SECRET, { expiresIn: "1h" })
            res.cookie("usercookie", token, { httpOnly: true })

            if (!usuario) {
                logger.warn(`El email ${email} no está registrado`);
                CustomError.createError("resetPassword --> UserController", "Email no encontrado", "El correo electrónico no se encuentra registrado", TIPOS_ERROR.NOT_FOUND)
            }

            const transport = nodemailer.createTransport({
                service: "gmail",
                port: 587,
                auth: {
                    user: "akeno.camiel@gmail.com",
                    pass: "gkzftvorupgjdqpr",
                },
            })

            await transport.sendMail({
                from: "Recuperación de contraseña <akeno.camiel@gmail.com>",
                to: email,
                subject: "Código de recuperación de contraseña",
                html: `
                    <div>
                        <h1>¿Olvidaste tu contraseña?</h1>
                        <h3>No te preocupes, con solo dos pasos ya tendrás tu cuenta nuevamente.</h3>
                    </div>
                    <div>
                        <p>Por favor, haz <a href="http://localhost:8080/newpassword/${token}">click aqui</a> para restablecer tu contraseña</p>
                        <br>
                        <p>El código para recuperar tu contraseña es: ${token}<br>Si no fuiste tú quién lo solicitó, ignora este mensaje.</p>
                    </div>
                    `
            })

            logger.info(`Correo de recuperación de contraseña enviado al usuario ${email}`);
            res.setHeader("Content-Type", "text/html")
            res.status(200).json(`Recibirá un correo en ${usuario.email} para restablecer su contraseña`)
        } catch (error) {
            return next(error)
        }
    }

    static createNewPassword = async (req, res, next) => {
        logger.info("Reiniciando la contraseña");

        if (!req.cookies.usercookie) {
            return CustomError.createError("createNewPassword --> UserController", "Token inválido", "El token es inválido o ha expirado", TIPOS_ERROR.ARGUMENTOS_INVALIDOS);
        }

        let { password } = req.body;
        let token = req.params.token;

        try {
            let decoded = jwt.verify(token, SECRET);
            // logger.debug("Token Decodificado:", decoded);
            let id = decoded._id;
            // logger.debug("ID del Usuario:", id);
            const user = await userService.getUserId(id);
            if (!user) {
                return CustomError.createError("createNewPassword --> UserController", "Usuario no encontrado", "El usuario con el ID proporcionado no existe", TIPOS_ERROR.NOT_FOUND);
            }

            if (validaPassword(password, user.password)) {
                return CustomError.createError("createNewPassword --> UserController", "Contraseña repetida", "La nueva contraseña no puede ser igual a la anterior", TIPOS_ERROR.ARGUMENTOS_INVALIDOS);
            }

            logger.info("La contraseña es válida, hasheando y actualizando");

            let hashedPassword = generaHash(password);
            let updatedUser = await userService.updatePassword(id, hashedPassword);

            if (!updatedUser) {
                logger.error("Error al actualizar la contraseña del usuario");
                return CustomError.createError("createNewPassword --> UserController", "Error al actualizar la contraseña", "Error al actualizar la contraseña del usuario", TIPOS_ERROR.INTERNAL_SERVER_ERROR);
            }

            res.clearCookie("usercookie");
            logger.info("Contraseña actualizada con éxito");
            return res.status(200).json({ status: "success", message: "Contraseña actualizada con éxito" });
        } catch (error) {
            if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
                logger.error('Token inválido o expirado');
                return res.status(400).json({ status: "error", message: "Token inválido o expirado" });
            }
            return next(error);
        }
    }

    static userPremium = async (req, res, next) => {

        let { uid } = req.params

        logger.info(`Solicitud para cambiar el rol del usuario: ${uid}`);

        if (!isValidObjectId(uid)) {
            res.setHeader("Content-Type", "application/json")
            CustomError.createError("userPremium --> UserController", "ID inválido", "Ingrese un ID válido de MONGODB", TIPOS_ERROR.ARGUMENTOS_INVALIDOS)
        }

        try {
            let user = await userService.getUserId({ _id: uid })
            if (!user) {
                res.setHeader("Content-Type", "application/json")
                CustomError.createError("userPremium --> UserController", "Usuario no encontrado", `No existe el usuario con id ${uid}`, TIPOS_ERROR.NOT_FOUND)
            }

            if (!user.rol) {
                logger.error(`El usuario no tiene la propiedad 'rol'`);
                CustomError.createError("userPremium --> UserController", "El usuario no tiene la propiedad 'rol'", "El usuario no tiene la propiedad 'rol'", TIPOS_ERROR.NOT_FOUND)
            }

            logger.info(`Usuario obtenido: ${JSON.stringify(user)}`);

            switch (user.rol) {
                case "usuario":
                    user.rol = "premium";
                    break;
                case "premium":
                    user.rol = "usuario";
                    break;
                default:
                    logger.error(`Rol desconocido: ${user.rol}`);
                    CustomError.createError("userPremium --> UserController", "Rol desconocido", `Rol de usuario desconocido: ${user.rol}`, TIPOS_ERROR.ARGUMENTOS_INVALIDOS)
            }

            logger.info(`Nuevo rol del usuario: ${user.rol}`);

            const updateUser = await userService.updateRol(uid, user.rol)
            logger.info(`Usuario actualizado a rol: ${updateUser.rol}`);
            res.status(200).send({ status: "success", updateUser });
        } catch (error) {
            return next(error)
        }
    }


    static getUsers = async (req, res) => {
        let users = await userService.getAllUser()
        return res.status(200).json({ users })
    }
}



