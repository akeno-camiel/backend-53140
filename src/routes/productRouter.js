// import path from 'path';
// import __dirname from "../utils.js";
// const rutaProducto = path.join(__dirname, 'data', 'productos.json');
import { isValidObjectId } from 'mongoose';
import { Router } from 'express';
import { io } from "../app.js";
import ProductManager from '../dao/ProductManagerMONGO.js';
const productManager = new ProductManager();
export const router = Router();


router.get("/", async (req, res) => {
    let products
    try {
        res.setHeader('Content-Type', 'application/json');
        products = await productManager.getProducts();
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
    let id = req.params.pid;
    if (!isValidObjectId(id)) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(400).json({ error: `Ingrese un ID válido de MONGODB` })
    }
    try {
        res.setHeader('Content-Type', 'application/json');
        const product = await productManager.getProductsBy({ _id: id });

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

        // const products = await productManager.getProducts();
        // const codeRepeat = products.some(product => product.code === code);

        let codeRepeat
        try {
            codeRepeat = await productManager.getProductsBy({ code })
        } catch (error) {
            res.setHeader('Content-Type', 'application/json');
            return res.status(500).json(
                {
                    error: `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`,
                    detalle: `${error.message}`
                }
            )
        }

        if (codeRepeat) {
            return res.status(400).json({ error: `Error, el código ${code} se está repitiendo` });
        }

        try {
            nuevoProducto = await productManager.addProduct({ title, description, price, thumbnail, code, stock, category })
        } catch (error) {
            res.setHeader('Content-Type', 'application/json');
            return res.status(500).json(
                {
                    error: `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`,
                    detalle: `${error.message}`
                }
            )
        }
    } catch (error) {
        res.status(500).json({ error: `Error inesperado en el servidor`, detalle: `${error.message}` });
    }
    const productList = await productManager.getProducts();
    io.emit("nuevoProducto", productList)
    res.setHeader('Content-Type', 'application/json');
    return res.status(201).json(nuevoProducto);
})

router.put("/:pid", async (req, res) => {
    let id = req.params.pid;

    try {

        if (!isValidObjectId(id)) {
            res.setHeader('Content-Type', 'application/json');
            return res.status(400).json({ error: `Ingrese un ID válido de MONGODB` })
        }
        
        // const currentProduct = await productManager.getProductsBy(id);

        // if (!('stock' in req.body)) {
        //     stock = currentProduct.stock;
        // }
        // if (!('price' in req.body)) {
        //     price = currentProduct.price;
        // }
        // if (!('category' in req.body)) {
        //     category = currentProduct.category;
        // }
        // if (!('thumbnail' in req.body)) {
        //     thumbnail = currentProduct.thumbnail;
        // }
        // if (!('title' in req.body)) {
        //     title = currentProduct.title;
        // }
        // if (!('description' in req.body)) {
        //     description = currentProduct.description;
        // }

        res.setHeader('Content-Type', 'application/json');
        let stock, price, category, thumbnail, title, description
        let updateData = req.body

        if (updateData._id) {
            delete updateData._id;
        }

        if (updateData.code) {
            let exist;

            try {
                exist = await productManager.getProductsBy({ code: updateData.code })
                if (exist) {
                    res.setHeader('Content-Type','application/json');
                    return res.status(400).json({error:`Ya existe otro producto con codigo ${updateData.code}`})
                }
            } catch (error) {
                res.setHeader('Content-Type', 'application/json');
                return res.status(500).json(
                    {
                        error: `${error.message}`
                    }
                )
            }
        }

        if ((stock !== undefined && isNaN(stock)) || (price !== undefined && isNaN(price))) {
            return res.status(400).json({ error: "Stock y precio deben ser números" });
        }

        try {
            let productoModificado = await productManager.updateProduct(id, updateData);
            return res.status(200).json(`El producto ${id} se ha modificado: ${productoModificado}`);
        } catch (error) {
            res.status(300).json({ error: `Error al modificar el producto`, detalle: `${error.message}` });
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
});

router.delete("/:pid", async (req, res) => {
    let productoEliminado
    let id = req.params.pid;

    if (!isValidObjectId(id)) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(400).json({ error: `Ingrese un ID válido de MONGODB` })
    }
    try {
        productoEliminado = await productManager.deleteProduct(id);
        if(productoEliminado.deletedCount > 0){
            res.setHeader('Content-Type','application/json');
            return res.status(200).json({payload:`El producto con id ${id} fue eliminado`});
        }else{
            res.setHeader('Content-Type','application/json');
            return res.status(400).json({error:`No existe ningun producto con el id ${id}`})
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

    let products = productManager.getProducts();
    io.emit("productoEliminado", products);

    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json(productoEliminado);

})