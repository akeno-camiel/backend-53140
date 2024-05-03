import ProductManager from "./ProductManagerMONGO.js";
import { cartModelo } from './models/cartModelo.js';

export default class CartManager {

    async getCarts() {
        return await cartModelo.find().lean()
    };

    async createCart() {
        return await cartModelo.create({ products: [] })
    };

    async getCartsBy(cid) {
        return await cartModelo.findOne({ _id: cid }).lean()
    };

    async getCartsProducts(id) {
        const carts = await this.getCarts();
        const cart = carts.find(c => c.id === id);
        return cart.products;
    };

async addProductToCart(cid, pid) {
    try {
        const cart = await cartModelo.findById(cid);

        if (!cart) {
            return `Carrito con id ${cid} no encontrado`;
        }

        const existingProductIndex = cart.products.findIndex(product => product._id && product._id.toString() === pid);

        if (existingProductIndex !== -1) {
            cart.products[existingProductIndex].quantity++;
        } else {
            const productManager = new ProductManager();
            const product = await productManager.getProductsBy({ _id: pid });

            if (!product || product === "Not found") {
                console.log(`Producto con id ${pid} no encontrado`);
                return `Producto con id ${pid} no encontrado`;
            }

            const newProduct = {
                id: pid,
                quantity: 1
            };

            cart.products.push(newProduct);
            console.log(`Nuevo producto agregado al carrito: ${newProduct}`);

        }

        await cart.save();
        console.log(`Carrito guardado correctamente: ${cart}`);

        return cart;
    } catch (error) {
        console.log(`Error al añadir producto: ${error}`);
        return `Error al añadir producto: ${error}`;
    }
};

};
