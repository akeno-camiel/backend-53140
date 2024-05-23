import { userModel } from "./models/userModel.js";


export default class UserManager {

    async createUser(user) {
        let newUser = await userModel.create(user);
        return newUser.toJSON();
    };

    async getUsersBy(filtro = {}) {
        return await userModel.findOne(filtro).lean();
    };

    async getByPopulate(filtro = {}) {
        return await usuariosModelo.findOne(filtro).populate("carrito").lean()
    }
}