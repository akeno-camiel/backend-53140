class ProductManager {

    #products
    static idProducto = 1;

    constructor() {
        this.#products = [];
    }

    addProduct(title, description, price, thumbnail, code, stock) {
        if (!title || !description || !price || !thumbnail || !code || !stock)
            return 'Todos los campos son obligatorios';

        const codeRepeat = this.#products.some(product => product.code === code);
        if (codeRepeat)
            return `Error, el código ${code} se está repitiendo`;

        const id = ProductManager.idProducto++;

        const newProduct = {
            id: id,
            title: title,
            description: description,
            price: price,
            thumbnail: thumbnail,
            code: code,
            stock: stock
        };

        this.#products.push(newProduct);
        return 'El producto se ha añadido correctamente';
    }

    getProducts() {
        return this.#products;
    }

    getProductsById(id) {
        const producto = this.#products.find(product => product.id === id);
        if (producto) {
            return producto;
        } else {
            return `No se encontraron productos con la ID: ${id}`
        };
    }
}

module.exports = ProductManager;