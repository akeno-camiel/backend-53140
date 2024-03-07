const ProductManager = require("./desafio");

const product1 = new ProductManager();

console.log(product1.addProduct('producto prueba','Este es un producto prueba', 200, 'sin imagen', 'abc123', '25'));
console.log(product1.getProductsById(2));
console.log(product1.getProducts());

