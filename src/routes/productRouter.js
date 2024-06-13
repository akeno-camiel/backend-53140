import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { ProductController } from '../controller/productController.js';
export const router = Router();


router.get("/", ProductController.getProducts);

router.get("/:pid", ProductController.getProductById);

router.post("/", auth(["admin"]), ProductController.createProduct)

router.put("/:pid", auth(["admin"]), ProductController.updateProduct);

router.delete("/:pid", auth(["admin"]), ProductController.deleteProduct)