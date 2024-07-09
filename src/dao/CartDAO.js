import { CustomError } from "../utils/CustomError.js";
import { TIPOS_ERROR } from "../utils/EErrors.js";
import ProductManager from "./ProductDAO.js";
import { cartModelo } from './models/cartModelo.js';

export default class CartManager {

    async getCarts() {
        return await cartModelo.find().populate("products.product").lean();
    };

    async createCart() {
        let cart = await cartModelo.create({ products: [] });
        return cart.toJSON();
    };

    async getCartsBy(filtro = {}) {
        return await cartModelo.findOne(filtro).populate("products.product").lean();
    };

    async getCartsProducts(id) {
        const carts = await this.getCarts();
        const cart = carts.find(c => c.id === id);
        return cart.products;
    };

    async addProductToCart(cid, pid, next) {
        try {
            const cart = await cartModelo.findById(cid);

            if (!cart) {
                return CustomError("addProductToCart --> cartDAO", "Carrito no encontrado", `No se encontró un carrito con el ID: ${cid}`, TIPOS_ERROR.NOT_FOUND);
            }

            const existingProductIndex = cart.products.findIndex(product => product.product == pid);

            if (existingProductIndex !== -1) {
                cart.products[existingProductIndex].quantity++;
            } else {
                const productManager = new ProductManager();
                const product = await productManager.getProductsBy({ _id: pid });

                if (!product || product === "Not found") {
                    return CustomError("addProductToCart --> cartDAO", "Producto no encontrado", `No se encontró un producto con el ID: ${pid}`, TIPOS_ERROR.NOT_FOUND);
                }

                const newProduct = {
                    product: pid,
                    quantity: 1
                };

                cart.products.push(newProduct);
                console.log(`Nuevo producto agregado al carrito: ${newProduct}`);
            }

            await cart.save();
            console.log(`Carrito guardado correctamente: ${cart}`);

            return cart;
        } catch (error) {
            return next(error)
        }
    };

    async updateCart(cid, products) {
        try {
            let cart = await cartModelo.findByIdAndUpdate(
                cid,
                { $set: { products: products } },
                { returnDocument: "after" }
            );
            return `Carrito ${JSON.stringify(cart, null, 5)}`
        } catch (error) {
            CustomError.createError("updateCart --> cartDAO", "Error al actualizar el carrito", "Error actualizar el carrito", TIPOS_ERROR.INTERNAL_SERVER_ERROR);
        }
    };

    async updateProductQ(cid, pid, quantity) {
        try {
            let cart = await cartModelo.findOneAndUpdate(
                { _id: cid, "products.product": pid },
                { $set: { "products.$.quantity": quantity } },
                { new: true }
            ).populate("products.product");
            return cart;
        } catch (error) {
            CustomError.createError("updateProductQ --> cartDAO", "Error al actualizar la cantidad de productos", "Error actualizar la cantidad de productos", TIPOS_ERROR.INTERNAL_SERVER_ERROR);
        }
    };

    async deleteAllProductsFromCart(cid, next) {
        try {
            const cart = await cartModelo.findByIdAndUpdate(
                cid,
                { $set: { products: [] } },
                { returnDocument: "after" }
            );

            if (!cart) {
                return CustomError("deleteAllProductsFromCart --> cartDAO", "Carrito no encontrado", `No se encontró un carrito con el ID: ${cid}`, TIPOS_ERROR.NOT_FOUND);
            }

            cart.products = [];

            await cart.save();
            console.log(`Productos eliminados correctamente: ${cart}`);

            return cart;
        } catch (error) {
            return next(error)
        }
    };

    async deleteProductFromCart(cid, pid, next) {
        try {
            const cart = await cartModelo.findByIdAndUpdate(
                cid,
                { $inc: { 'products.$[product].quantity': -1 } },
                { new: true, arrayFilters: [{ 'product.product': pid }] }
            );

            if (!cart) {
                return CustomError("deleteProductFromCart --> cartDAO", "Carrito no encontrado", `No se encontró un carrito con el ID: ${cid}`, TIPOS_ERROR.NOT_FOUND);
            }

            const updatedProduct = cart.products.find(p => p.product == pid);
            if (updatedProduct.quantity <= 0) {
                cart.products.pull({ product: pid });
                await cart.save();
            }

            return cart;
        } catch (error) {
            return next(error)
        }
    };
};
