const fs = require('fs');

class CartManager {

    static idcart = 1;

    constructor(rutaArchivo) {
        this.path = rutaArchivo;
    };

    async init() {
        const carts = await this.getCarts();
        if (carts.length > 0) {
            const maxId = Math.max(...carts.map(cart => cart.id));
            CartManager.idcart = maxId + 1;
        }
        return CartManager.idcart;
    };

    async addCart(newCarrito) {
        let carts = await this.getCarts();
        let id = await this.init();
        newCarrito = {
            id: id,
            products: []
        };
        carts.push(newCarrito);
        await this.saveCart(carts);
        return `El carrito se ha añadido correctamente ${newCarrito}`;
    };


    async getCarts() {
        if (fs.existsSync(this.path)) {
            const data = await fs.promises.readFile(this.path, { encoding: "utf-8" });
            console.log("Datos leídos del archivo JSON:", data);
            return JSON.parse(data);
        } else {
            console.log(`El archivo JSON no existe en la ruta: ${this.path}. Creando un nuevo archivo...`);
            await this.saveCart([]);
            return [];
        }
    };


    async saveCart(data) {
        const jsonData = JSON.stringify(data, null, 4);
        await fs.promises.writeFile(this.path, jsonData, 'utf8');
        console.log('Archivo guardado correctamente');
    };

    async getCartsById(id) {
        const carts = await this.getCarts();
        const cart = carts.find(c => c.id === id);
        return cart;
    };

    async addProductToCart(cid, pid) {
        const carts = await this.getCarts();
        const index = carts.findIndex(cart => cart.id === cid)
        if (index !== -1) {
            const cartById = await this.getCartsById(cid)
            const productInCart = cartById.findIndex(product => product.id === pid)
            if (productInCart !== -1) {
                cartById[productInCart].quantity = cartById[productInCart].quantity + 1
            } else {
                const updatedCartById = await this.getCartsById(cid);
                updatedCartById.push({ pid, quantity: 1 });
                await this.saveCart(updatedCartById);
            }
            carts[index].products = cartById

            await this.saveCart(carts)
            console.log('Archivo guardado correctamente');
        }
    };
};
module.exports = CartManager;