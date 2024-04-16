import { Router } from 'express';
import ProductManager from '../dao/ProductManager.js';
export const router = Router();
import path from 'path';
import __dirname from "../utils.js";
const rutaProducto = path.join(__dirname, 'data', 'productos.json');
const productManager = new ProductManager(rutaProducto);
import { io } from "../app.js";


router.get("/", async (req, res) => {
    try {
        res.setHeader('Content-Type', 'application/json');
        const products = await productManager.getProducts();
        let limit = req.query.limit;
        if (limit === undefined) {
            res.status(200).json(products);
        } else {
            limit = Number(limit);
            if (isNaN(limit)) {
                return res.status(400).json({ error: "Ingrese un ID numérico" });
            }
            if (limit && limit > 0) {
                products = products.slice(0, limit);
            }
            res.status(200).json(products);
        }
    } catch (error) {
        res.status(500).json({ error: `Error inesperado en el servidor`, detalle: `${error.message}` });
    }
});

router.get("/:pid", async (req, res) => {
    try {
        res.setHeader('Content-Type', 'application/json');
        let id = Number(req.params.pid);
        if (isNaN(id)) {
            return res.status(400).json({ error: "Ingrese un ID numérico válido" });
        }
        const product = await productManager.getProductsById(id);

        if (product) {
            res.status(200).json(product);
        } else {
            return res.status(404).json({ error: `No existe un producto con el ID: ${id}` });
        }

    } catch (error) {
        res.status(500).json({ error: `Error inesperado en el servidor`, detalle: `${error.message}` });
    }
});

router.post("/", async (req, res) => {
    let nuevoProducto
    try {
        const { title, description, price, thumbnail, code, stock, category } = req.body;

        if (!title || !description || !price || !thumbnail || !code || !stock || !category) {
            return res.status(400).json({ error: 'Todos los campos son obligatorios' });
        }
        if (typeof price !== 'number' || typeof stock !== 'number') {
            return res.status(400).json({ error: 'El precio y el stock deben ser números' })
        }

        const products = await productManager.getProducts();
        const codeRepeat = products.some(product => product.code === code);
        if (codeRepeat) {
            return res.status(400).json({ error: `Error, el código ${code} se está repitiendo` });
        }
        nuevoProducto = await productManager.addProduct({ title, description, price, thumbnail, code, stock, category })
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: `Error inesperado en el servidor`, detalle: `${error.message}` });
    }
    const productList= await productManager.getProducts();
    io.emit("nuevoProducto", productList)
    res.setHeader('Content-Type', 'application/json');
    return res.status(201).json(nuevoProducto);
})

router.put("/:pid", async (req, res) => {
    try {
        res.setHeader('Content-Type', 'application/json');
        let id = Number(req.params.pid);
        let { title, description, price, thumbnail, stock, category } = req.body
        const currentProduct = await productManager.getProductsById(id);

        if (!('stock' in req.body)) {
            stock = currentProduct.stock;
        }
        if (!('price' in req.body)) {
            price = currentProduct.price;
        }
        if (!('category' in req.body)) {
            category = currentProduct.category;
        }
        if (!('thumbnail' in req.body)) {
            thumbnail = currentProduct.thumbnail;
        }
        if (!('title' in req.body)) {
            title = currentProduct.title;
        }
        if (!('description' in req.body)) {
            description = currentProduct.description;
        }

        if ((stock !== undefined && isNaN(stock)) || (price !== undefined && isNaN(price))) {
            return res.status(400).json({ error: "Stock y precio deben ser números" });
        }

        let productoModificado = await productManager.updateProduct(id, { title, description, price, thumbnail, stock, category });
        return res.status(200).json(`El producto ${id} se ha modificado: ${productoModificado}`);
    } catch (error) {
        res.status(500).json({ error: `Error inesperado en el servidor`, detalle: `${error.message}` });
    }
});

router.delete("/:pid", async (req, res) => {
    let productoEliminado
    try {
        let id = req.params.pid;
        productoEliminado = await productManager.deleteProduct(id);

    } catch (error) {
        res.status(500).json({ error: "Error interno del servidor" });
    }

    let products=productManager.getProducts();
    io.emit("productoEliminado", products);

    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json(productoEliminado);

})