const fs = require('fs');
const path = require('path');

class ProductManager {

    static idProducto = 1;

    constructor() {
        this.products = this.getProducts()
        this.path = path.join(__dirname, "./data/productos.json");

    }

    getProducts() {
        try {
            if (fs.existsSync(this.path)) {
                const json = fs.promises.readFile(this.path, { encoding: "utf-8" })
                return JSON.parse(json);
            } else {
                return [];
            }
        } catch (error) {
            console.log(`Error al leer el archivo, ${error}`);
        }
        return [];
    }

    async saveProduct() {
        try {
            await fs.promises.writeFile(this.path, JSON.stringify(this.products, null, 4));
            console.log('Archivo guardado correctamente');
        } catch (error) {
            console.log(`Error al guardar el archivo, ${error}`);
        }
    }

    async addProduct(title, description, price, thumbnail, code, stock) {
        if (!title || !description || !price || !thumbnail || !code || !stock)
            return 'Todos los campos son obligatorios';

        if (typeof price !== 'number' || typeof stock !== 'number')
            return 'El precio y el stock deben ser números';

        const codeRepeat = this.products.some(product => product.code === code);
        if (codeRepeat)
            return `Error, el código ${code} se está repitiendo`;

        const id = ProductManager.idProducto++;

        const newProduct = {
            id: id,
            title: title,
            description: description,
            price: "$" + price,
            thumbnail: thumbnail,
            code: code,
            stock: stock
        };

        this.products.push(newProduct);
        await this.saveProduct();
        return 'El producto se ha añadido correctamente';
    }


    getProductsById(id) {
        const product = this.products.find(product => product.id === id);
        if (product) {
            return product;
        }
        return `No se encontraron productos con la ID: ${id}`

    };

    async updateProduct(id, updateData) {
        const index = this.products.findIndex(p => p.id === id);
        if (index >= 0) {
            const allowedParams = ['title', 'description', 'price', 'thumbnail', 'stock'];
            const updateKeys = Object.keys(updateData);
    
            if (updateKeys.some(key => !allowedParams.includes(key))) {
                console.log(`Error: Los parámetros añadidos no son válidos para la actualización. Solo se admitirán ${allowedParams}`);
                return 'Error: Parámetros no válidos';
            }
    
            if (updateKeys.includes('price') && typeof updateData.price !== 'number') {
                return 'Error: El precio debe ser un número';
            }
    
            if (updateKeys.includes('stock') && typeof updateData.stock !== 'number') {
                return 'Error: El stock debe ser un número';
            }
    
            this.products[index] = { ...this.products[index], ...updateData };
            await this.saveProduct();
            console.log(`El producto con la ID: ${id} ha sido actualizado`);
            return 'Producto actualizado correctamente';
        } else {
            console.log(`El producto con el id ${id} no existe`);
            return 'Error: Producto no encontrado';
        }
    }
    



    async deleteProduct(id) {
        const index = this.products.findIndex(p => p.id === id);
        if (index >= 0) {
            this.products = this.products.filter(p => p.id !== id);
            await this.saveProduct();
            console.log(`El producto con la ID: ${id} ha sido eliminado`);
        };

        return console.log(`El producto con el id ${id} no existe`);
    };
};

module.exports = ProductManager;

