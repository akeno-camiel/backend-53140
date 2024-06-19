import { Router } from 'express';
import { auth, verifyJWT } from '../middleware/auth.js';
import { CartController } from '../controller/cartController.js';

export const router = Router();

router.get('/', CartController.getCarts)

router.get('/:cid', CartController.getCartsById)

router.get('/:cid/purchase', CartController.getCartsById)

router.post('/', CartController.createCart)

router.post('/:cid/products/:pid', verifyJWT, auth(["usuario"]), CartController.addToCart)

router.put('/:cid', verifyJWT, auth(["usuario"]), CartController.updateCart)

router.put('/:cid/products/:pid', verifyJWT, auth(["usuario"]), CartController.updateQuantity)

router.delete('/:cid', verifyJWT, auth(["usuario"]), CartController.clearCart)

router.delete('/:cid/products/:pid', verifyJWT, auth(["usuario"]), CartController.deleteProductFromCart);
