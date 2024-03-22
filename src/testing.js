const ProductManager = require("./desafio1");

const product = new ProductManager();

const execute = async () => {
    console.log(await product.addProduct('producto prueba', 'Este es un producto prueba', 200, 'sin imagen', 'abc123', 12));
    console.log(await product.addProduct('PS3', 'Este es un producto prueba', 200, 'sin imagen', 'abc124', 25));
    console.log(await product.addProduct('producto prueba', 'Este es un producto prueba', 200, 'sin imagen', 'abc125', 41));

    console.log(await product.addProduct('Nintendo Gameboy', 'Consola portatil retro', 520, 'sin imagen', 'abc126', 2));
};

execute ();
