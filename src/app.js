const express = require('express');
const ProductManager = require('./desafio1.js');

const PORT = 3000;
const app = express();
const productManager = new ProductManager();

app.get("/", (req, res) => {
    res.send("Home Page");
})

app.get("/product", async (req, res) => {
    try {
        let products = await productManager.getProducts();
        let limit = req.query.limit;


        if (limit === undefined) {
            res.json(products);
        } else {
            limit = Number(limit);
            if (isNaN(limit)) {
                return res.json({ error: "Ingrese un ID numérico" });
            }
            if (limit && limit > 0) {
                products = products.slice(0, limit);
            }
            res.json(products);
        }
    } catch (error) {
        console.error("Error al obtener productos:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }});

app.get("/product/:id", async (req, res) => {
    try {
        let products = await productManager.getProducts();
        let id = req.params.id;
        id = Number(id);
        if (isNaN(id)) {
            return res.json({ error: "Ingrese un ID numérico" });
        }
        let product = products.find(p => p.id === id);

        if (product) {
            res.json(product);
        } else {
            res.json({ error: `No existen heroes con el id: ${id}` });
        }
    } catch (error) {
        console.error("Error al obtener productos:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }});


app.listen(PORT, () => {
    console.log(`Server online en puerto ${PORT}`);
})
