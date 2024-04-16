import express from "express";
import path from "path";
import __dirname from "./utils.js";
import { engine } from "express-handlebars";
import { Server } from "socket.io";

import { router as vistasRouter } from './routes/vistas.router.js';
import { router as cartRouter } from './routes/cartRouter.js';
import { router as productRouter } from './routes/productRouter.js';


const PORT = 8080;
const app = express();

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, '/views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '/public')));

app.use('/', vistasRouter);
app.use('/api/product', productRouter);
app.use('/api/carts', cartRouter);


const server = app.listen(PORT, () => {
    console.log(`Server escuchando en puerto ${PORT}`);
});

export const io = new Server(server);