import { Router } from 'express';
import ProductManager from '../dao/ProductManager.js';
import path from 'path';
import __dirname from "../utils.js";
export const router = Router()
const rutaArchivo = path.join(__dirname, 'data', 'productos.json');
const productManager = new ProductManager(rutaArchivo);

router.get('/', async (req, res) => {
    let products
    try {
        products = await productManager.getProducts()
    } catch {
        res.setHeader('Content-Type', 'application/json');
        return res.status(500).json(
            {
                error: `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`,
            }
        )
    }
    res.setHeader('Content-Type', 'text/html')
    res.status(200).render('home', { products })
})
router.get('/realtimeproducts', async (req, res) => {
    let products
    try {
        products = await productManager.getProducts();
    } catch (error) {
        console.log(error)
        res.setHeader('Content-Type', 'application/json');
        return res.status(500).json(
            {
                error: `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`,
            }
        )
    }
    res.setHeader('Content-Type', 'text/html')
    res.status(200).render('realTime', { products })
})