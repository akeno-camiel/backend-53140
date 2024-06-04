import passport from "passport";
import passportJWT from "passport-jwt";
import local from "passport-local";
import UserManager from "../dao/UsersManager.js";
import { generaHash, validaPassword, SECRET } from "../utils.js";
import github from "passport-github2"
import CartManager from "../dao/CartManagerMONGO.js";
const cartManager = new CartManager();
const userManager = new UserManager();

const buscaToken = (req) => {
    let token = null

    if (req.cookies["codercookie"]) {
        token = req.cookies["codercookie"]
    }

    return token
}

export const initPassport = () => {
    passport.use(
        "registro",
        new local.Strategy({
            usernameField: "email",
            passReqToCallback: true
        },
            async (req, username, password, done) => {
                try {
                    let { first_name, last_name, age } = req.body;

                    if (!first_name || !last_name || !age) {
                        // res.setHeader('Content-Type', 'application/json');
                        // return res.status(400).json({ error: `Complete los campos requeridos` })
                        return done(null, false);
                    }

                    let existEmail = await userManager.getUsersBy({ email: username })
                    if (existEmail) {
                        // res.setHeader('Content-Type', 'application/json');
                        // return res.status(400).json({ error: `El email indicado ya existe` })
                        return done(null, false);
                    }

                    password = generaHash(password)

                    let newCart = await cartManager.createCart();

                    let newUser = await userManager.createUser({ first_name, last_name, email: username, age, password, cart: newCart._id })
                    return done(null, newUser);
                } catch (error) {
                    return done(error)
                }
            }
        )
    )

    passport.use(
        "login",
        new local.Strategy({
            usernameField: "email"
        },
            async (username, password, done) => {
                try {
                    let user = await userManager.getUsersBy({ email: username })
                    if (!user) {
                        return done(null, false)
                    }

                    if (!validaPassword(password, user.password)) {
                        return done(null, false)
                    }
                    user = { ...user }
                    delete user.password
                    return done(null, user);
                } catch (error) {
                    return done(error)
                }
            }
        )
    )

    passport.use(
        "github",
        new github.Strategy(
            {
                clientID: "Iv23liEMp0RXxPDkCn6K",
                clientSecret: "7e2f2b2e30fa33ec3db49f2d39a18d620ed35876",
                callbackURL: "http://localhost:8080/api/sessions/callbackGitHub"
            },
            async (tokenAcceso, tokenRefresh, profile, done) => {
                try {
                    console.log(profile)
                    let email = profile._json.email
                    if (!email) {
                        return done(null, false);
                    }
                    let first_name = profile._json.name
                    let user = await userManager.getByPopulate({ email })
                    if (!user) {
                        let newCart = await cartManager.createCart()
                        user = await userManager.createUser({ first_name, email, profile, cart: newCart._id })
                    }

                    return done(null, user)
                } catch (error) {
                    return done(error)
                }
            }
        )
    )

    passport.use(
        "current",
        new passportJWT.Strategy(
            {
                secretOrKey: SECRET,
                jwtFromRequest: new passportJWT.ExtractJwt.fromExtractors([buscaToken])
            },
            async (contenidoToken, done) => {
                try {
                    return done(null, contenidoToken)
                } catch (error) {
                    return done(error)
                }
            }
        )
    )

    passport.serializeUser((user, done) => {
        return done(null, user._id)
    })

    passport.deserializeUser(async (id, done) => {
        let user = await userManager.getUsersBy({ _id: id })
        return done(null, user)
    })
}