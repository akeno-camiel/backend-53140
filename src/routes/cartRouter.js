const { Router } = require('express');
const CartManager = require('../dao/CartManager.js');
const router = Router();
const path = require('path');
const rutaArchivo = path.join(__dirname, '..', 'data', 'carritos.json');
const cartManager = new CartManager(rutaArchivo);

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
        const cid = Number(req.params.cid)
        const cart = await cartManager.getCartsProducts(cid)
        if (isNaN(cid)) {
            return res.status(400).json({ error: "Ingrese un ID numérico válido" });
        }

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
        newCart = await cartManager.addCart();
        res.status(200).json(newCart)
    } catch (error) {
        res.status(500).json({ error: `Error inesperado en el servidor`, detalle: `${error.message}` });
    }
})

router.post('/:cid/products/:pid', async (req, res) => {
    try {
        res.setHeader('Content-Type', 'application/json')
        const { cid, pid } = req.params;
        const added = await cartManager.addProductToCart(Number(cid), Number(pid));
        res.status(200).json({success: true, message: 'Producto agregado exitosamente', added})
    } catch (error) {
        res.status(500).json({ error: `Error inesperado en el servidor`, detalle: `${error.message}` });
    }
})



module.exports = router


