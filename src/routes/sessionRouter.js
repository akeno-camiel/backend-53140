import { Router } from 'express';
import passport from 'passport';
import { error } from 'console';
import { passportCall } from '../middleware/auth.js';
export const router = Router()

router.get('/logout', (req, res) => {
    req.session.destroy(error => {
        if (error) {
            res.setHeader('Content-Type', 'application/json');
            return res.status(500).json(
                {
                    error: `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`,
                    detalle: `${error.message}`
                }
            )
        }
    })

    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json({ payload: "Cerraste la sesión con éxito" });
})

router.get('/error', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    return res.status(500).json(
        {
            error: `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`,
            detalle: `Fallo al autenticar: ${error.message}`
        }
    )

})

router.get('/github', passport.authenticate("github", {}), (req, res) => { })

router.get('/callbackGitHub', passport.authenticate("github", { failureRedirect: "/api/sessions/error" }), (req, res) => {
    req.session.user = req.user
    console.log(req.user)

    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json({ payload: "Login correcto", user: req.user });
})

router.get("/current", passportCall("current"), (req, res) => {
    console.log("req.user: ", req.user);
    const user = req.user;
    res.send({ status: "success", payload: user });
});

router.post('/register', passport.authenticate("registro", { failureRedirect: "/api/sessions/error" }), async (req, res) => {
    let web = req.body;

    if (web) {
        res.redirect("/login")
    } else {
        res.setHeader('Content-Type', 'application/json');
        return res.status(200).json({ payload: `Usuario creado exitosamente`, user: req.user });
    }

})

router.post('/login', passport.authenticate("login", { failureRedirect: "/api/sessions/error" }), async (req, res) => {
    let { web } = req.body;
    let user = { ...req.user }
    req.session.user = user

    if (web) {
        res.redirect("/products")
    } else {
        res.setHeader('Content-Type', 'application/json');
        return res.status(200).json({ payload: "Login correcto", user });
    }
})