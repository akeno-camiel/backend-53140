import jwt from 'jsonwebtoken'
import { SECRET } from '../utils/utils.js'
import { UsersDTO } from '../dto/UsersDTO.js'
import "express-async-errors"

export class SessionController {
    static logout = (req, res) => {
        res.clearCookie("codercookie", { httpOnly: true })
        res.setHeader("Content-Type", "text/html")
        return res.status(200).json({ payload: "Cerraste la sesión con éxito" });
    }

    // static error = (req, res, error) => {
    //     res.setHeader('Content-Type', 'application/json');
    //     return res.status(500).json(
    //         {
    //             error: `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`,
    //             detalle: `${error.message}`
    //         }
    //     )
    // }
    static error = (req, res, error) => {
        const errorMessage = error?.message || 'Error desconocido';
        res.setHeader('Content-Type', 'application/json');
        return res.status(500).json({
            error: `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`,
            detalle: errorMessage
        });
    }

    static callbackGitHub = (req, res) => {
        let tokenData = {
            first_name: req.user.first_name,
            email: req.user.email,
            rol: req.user.rol,
            cart: req.user.cart
        }
        let token = jwt.sign(tokenData, SECRET, { expiresIn: "1h" })
        res.cookie("codercookie", token, { httpOnly: true })
        res.setHeader('Content-Type', 'application/json');
        return res.status(200).json({ payload: "Login correcto", user: req.user });
    }

    static current = (req, res) => {
        res.setHeader("Content-Type", "application/json")
        let userDTO = new UsersDTO(req.user)
        return res.status(200).json(userDTO)
    }

    static register = async (req, res) => {
        try {
            let web = req.body.web;

            if (web) {
                res.redirect("/login");
            } else {
                res.setHeader('Content-Type', 'application/json');
                return res.status(200).json({ payload: `Usuario creado exitosamente`, user: req.user });
            }
        } catch (error) {
            console.error('Error en el registro:', error); // Imprime el error en la consola
            return res.status(500).json({
                error: "Error inesperado en el servidor - Intente más tarde, o contacte a su administrador",
                detalle: error.message || 'Error desconocido'
            });
        }
    }


    static login = async (req, res) => {
        try {
            let { web } = req.body;
            let user = { ...req.user }
            let token = jwt.sign(user, SECRET, { expiresIn: "1h" })
            res.cookie("codercookie", token, { httpOnly: true })

            if (web) {
                res.redirect("/products")
            } else {
                res.setHeader('Content-Type', 'application/json');
                return res.status(200).json({ payload: "Login correcto", user, token });
            }
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: 'Error interno del servidor.'
            });
        }
    }
}