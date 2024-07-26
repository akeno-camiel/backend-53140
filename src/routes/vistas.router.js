export const router = Router()
import { Router } from 'express';
import { auth, verifyJWT } from '../middleware/auth.js';
import { ViewController } from '../controller/viewController.js';


router.get('/', ViewController.getProducts)

router.get('/realtimeproducts', ViewController.getRealTimeProducts)

router.get("/chat", verifyJWT, auth(["usuario", "premium"]), ViewController.getChat);

router.get("/products", verifyJWT, auth(["usuario", "premium"]), ViewController.getProductsPaginate);

router.get("/carts/:cid", verifyJWT, ViewController.getCartById)

router.get('/register', ViewController.register)

router.get('/login', ViewController.login)

router.get('/profile', verifyJWT, auth(["usuario", "admin", "premium"]), ViewController.getProfile)

router.get('/forgotpassword', ViewController.forgotPassword)

router.get('/newpassword/:token', ViewController.generateNewPassword)