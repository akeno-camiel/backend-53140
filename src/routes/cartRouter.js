import { Router } from 'express';
import mongoose, { isValidObjectId } from "mongoose";
import CartManager from '../dao/CartManagerMONGO.js';
import ProductManager from '../dao/ProductManagerMONGO.js';

export const router = Router();
const cartManager = new CartManager();

router.get('/', async (req, res) => {
    try {
        res.setHeader('Content-Type', 'application/json')
        const cart = await cartManager.getCarts()
        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ error: `Error inesperado en el servidor`, detalle: `${error.message}` });
    }
})

router.get('/:cid', async (req, res) => {
    try {
        res.setHeader('Content-Type', 'application/json')
        const cid = req.params.cid

        if (!isValidObjectId(cid)) {
            return res.status(400).json({
                error: `Ingrese un ID de MongoDB válido`,
            });
        }

        const cart = await cartManager.getCartsBy(cid)

        if (cart) {
            res.status(200).json(cart);
        } else {
            return res.status(404).json({ error: `No existe un carrito con el ID: ${cid}` });
        }
    } catch (error) {
        res.status(500).json({ error: `Error inesperado en el servidor`, detalle: `${error.message}` });
    }
})

router.post('/', async (req, res) => {
    try {
        res.setHeader('Content-Type', 'application/json')
        const newCart = await cartManager.createCart();
        res.status(200).json(`Carrito creado: ${newCart}`)
    } catch (error) {
        res.status(500).json({ error: `Error inesperado en el servidor`, detalle: `${error.message}` });
    }
})

router.post('/:cid/products/:pid', async (req, res) => {

    res.setHeader('Content-Type', 'application/json')
    const { cid, pid } = req.params;

    if (!isValidObjectId(cid, pid)) {
        return res.status(400).json({
            error: `Ingrese un ID de MongoDB válido`,
        });
    }

    try {
        await cartManager.addProductToCart(cid, pid);
        let cartUpdated = await cartManager.getCartsBy(cid);
        res.status(200).json({ success: true, message: 'Producto agregado exitosamente', cartUpdated })
    } catch (error) {
        res.status(500).json({ error: `Error inesperado en el servidor`, detalle: `${error.message}` });
    }
})
