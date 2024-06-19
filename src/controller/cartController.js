import { isValidObjectId } from "mongoose";
import { cartService } from "../services/cartService.js";
import { productService } from "../services/productService.js";

export class CartController {
    static getCarts = async (req, res) => {
        try {
            res.setHeader('Content-Type', 'application/json')
            const cart = await cartService.getCarts()

            res.status(200).json(cart);
        } catch (error) {
            res.status(500).json({ error: `Error inesperado en el servidor`, detalle: `${error.message}` });
        }
    }

    static getCartsById = async (req, res) => {
        try {
            res.setHeader('Content-Type', 'application/json')
            const cid = req.params.cid

            if (!isValidObjectId(cid)) {
                return res.status(400).json({
                    error: `Ingrese un ID de MongoDB válido`,
                });
            }

            const cart = await cartService.getCartsBy({ _id: cid })
            if (cart) {
                res.status(200).json(cart);
            } else {
                return res.status(404).json({ error: `No existe un carrito con el ID: ${cid}` });
            }
        } catch (error) {
            res.status(500).json({ error: `Error inesperado en el servidor`, detalle: `${error.message}` });
        }
    }

    static createCart = async (req, res) => {
        try {
            res.setHeader('Content-Type', 'application/json')
            const newCart = await cartService.createCart();
            res.status(200).json(`Carrito creado: ${newCart}`)
        } catch (error) {
            res.status(500).json({ error: `Error inesperado en el servidor`, detalle: `${error.message}` });
        }
    }

    static addToCart = async (req, res) => {

        res.setHeader('Content-Type', 'application/json')
        const { cid, pid } = req.params;

        if (!isValidObjectId(cid) || !isValidObjectId(pid)) {
            return res.status(400).json({
                error: `Ingrese un ID de MongoDB válido`,
            });
        }

        let productExists = await productService.getProductsBy({ _id: pid });
        if (!productExists) {
            res.setHeader('Content-Type', 'application/json');
            return res.status(400).json({ error: `No existe un producto con el ID: ${pid}` })
        }

        let cartExists = await cartService.getCartsBy({ _id: cid })
        if (!cartExists) {
            res.setHeader('Content-Type', 'application/json');
            return res.status(404).json({ error: `No existe un carrito con el ID: ${cid}` })
        }
        try {
            let resultado = await cartService.addProductToCart(cid, pid);
            res.status(200).json({ success: true, message: 'Producto agregado exitosamente', resultado })
        } catch (error) {
            res.status(500).json({ error: `Error inesperado en el servidor`, detalle: `${error.message}` });
        }
    }

    static updateCart = async (req, res) => {
        res.setHeader('Content-Type', 'application/json')
        let cid = req.params.cid
        let products = req.body;
        if (!isValidObjectId(cid)) {
            return res.status(400).json({
                error: `Ingrese un ID de MongoDB válido`,
            });
        }

        let cartExists = await cartService.getCartsBy({ _id: cid })
        if (!cartExists) {
            res.setHeader('Content-Type', 'application/json');
            return res.status(404).json({ error: `No existe un carrito con el ID: ${cid}` })
        }

        try {
            const newCart = await cartService.updateCart(cid, products);
            return res.status(200).json(newCart);
        } catch (error) {
            res.status(500).json({ error: `Error inesperado en el servidor`, detalle: `${error.message}` });
        }
    }

    static updateQuantity = async (req, res) => {
        res.setHeader('Content-Type', 'application/json')
        const { cid, pid } = req.params;
        let { quantity } = req.body;

        if (!isValidObjectId(cid) || !isValidObjectId(pid)) {
            return res.status(400).json({
                error: `Ingrese un ID de MongoDB válido`,
            });
        }

        let productExists = await productService.getProductsBy({ _id: pid });
        if (!productExists) {
            res.setHeader('Content-Type', 'application/json');
            return res.status(400).json({ error: `No existe un producto con el ID: ${pid}` })
        }


        let cartExists = await cartService.getCartsBy({ _id: cid })
        if (!cartExists) {
            res.setHeader('Content-Type', 'application/json');
            return res.status(404).json({ error: `No existe un carrito con el ID: ${cid}` })
        }

        try {
            const result = await cartService.updateProductQ(cid, pid, quantity);
            return res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ error: `Error inesperado en el servidor`, detalle: `${error.message}` })

        }
    }

    static clearCart = async (req, res) => {
        res.setHeader('Content-Type', 'application/json')
        const cid = req.params.cid

        if (!isValidObjectId(cid)) {
            return res.status(400).json({
                error: `Ingrese un ID de MongoDB válido`,
            });
        }

        let cartExists = await cartService.getCartsBy({ _id: cid })
        if (!cartExists) {
            res.setHeader('Content-Type', 'application/json');
            return res.status(404).json({ error: `No existe un carrito con el ID: ${cid}` })
        }

        try {
            let carritoEliminado = await cartService.deleteAllProductsFromCart(cid)
            if (carritoEliminado) {
                res.status(200).json({ message: 'All products removed from cart', carritoEliminado });
            } else {
                res.status(404).json({ message: 'Cart not found' });
            }
        } catch (error) {
            res.setHeader('Content-Type', 'application/json');
            return res.status(500).json(
                {
                    error: `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`,
                    detalle: `${error.message}`
                }
            )
        }
    }

    static deleteProductFromCart = async (req, res) => {
        res.setHeader('Content-Type', 'application/json')
        const { cid, pid } = req.params;

        if (!isValidObjectId(cid) || !isValidObjectId(pid)) {
            return res.status(400).json({
                error: `Ingrese un ID de MongoDB válido`,
            });
        }

        let productExists = await productService.getProductsBy({ _id: pid });
        if (!productExists) {
            res.setHeader('Content-Type', 'application/json');
            return res.status(400).json({ error: `No existe un producto con el ID: ${pid}` })
        }

        let cartExists = await cartService.getCartsBy({ _id: cid })
        if (!cartExists) {
            res.setHeader('Content-Type', 'application/json');
            return res.status(404).json({ error: `No existe un carrito con el ID: ${cid}` })
        }


        try {
            const cart = await cartService.deleteProductFromCart(cid, pid);

            if (cart) {
                res.status(200).json({ message: 'Product removed from cart', cart });
            } else {
                res.status(404).json({ message: 'Cart or product not found' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Error deleting product from cart', error });
        }
    }
}