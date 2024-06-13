import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { CartController } from '../controller/cartController.js';

export const router = Router();

router.get('/', CartController.getCarts)

router.get('/:cid', CartController.getCartsById)

router.post('/', CartController.createCart)

router.post('/:cid/products/:pid', CartController.addToCart)

router.put('/:cid', auth(["admin", "usuario"]), CartController.updateCart)

router.put('/:cid/products/:pid', auth(["admin", "usuario"]), CartController.updateQuantity)

router.delete('/:cid', auth(["admin", "usuario"]), CartController.clearCart)

router.delete('/:cid/products/:pid', auth(["admin", "usuario"]), CartController.deleteProductFromCart);