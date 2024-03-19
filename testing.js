const ProductManager = require("./desafio1");

const product = new ProductManager();

console.log(product.addProduct('producto prueba', 'Este es un producto prueba', 200, 'sin imagen', 'abc123', 12));

console.log(product.addProduct('PS3', 'Este es un producto prueba', 200, 'sin imagen', 'abc124', 25));

console.log(product.addProduct('producto prueba', 'Este es un producto prueba', 200, 'sin imagen', 'abc125', 41));

console.log(product.getProductsById(2));

console.log(product.updateProduct(1, {
    title: 'Xbox',
    description: 'Nueva consola',
    price: 300,
    thumbnail: 'sin imagen',
    stock: 15,
    id: 4
}));

console.log(product.updateProduct(2, { description: 'Consola Sony' }));

console.log(product.updateProduct(3, { title: 'Nintendo Switch', description: 'Consola portatil' }));

console.log(product.addProduct('Nintendo Gameboy', 'Consola portatil retro', 520, 'sin imagen', 'abc126', 2));

console.log(product.deleteProduct(3));
