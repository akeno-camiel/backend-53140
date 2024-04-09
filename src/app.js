const express = require('express');

const cartRouter = require('./routes/cartRouter.js');
const productRouter = require('./routes/productRouter.js');


const PORT = 8080;
const app = express();

app.use(express.json ());
app.use(express.urlencoded({extended: true}));
app.use(express.static('./public'))

app.use('/api/product', productRouter);
app.use('/api/carts', cartRouter);

app.get("/", (req, res) => {
    res.send("Home Page");
})

app.listen(PORT, () => {
    console.log(`Server online en puerto ${PORT}`);
})
