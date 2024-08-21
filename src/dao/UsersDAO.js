import { userModel } from "./models/userModel.js";


export default class UserManager {

    async createUser(user) {
        let newUser = await userModel.create(user);
        return newUser.toJSON();
    };

    async getAllUser() {
        return await userModel.find().lean();
    };

    async getUsersBy(filtro = {}) {
        return await userModel.findOne(filtro).lean();
    };

    async getUsersById(id) {
        return await userModel.findOne(id).lean();
    };

    async getByPopulate(filtro = {}) {
        return await userModel.findOne(filtro).populate("cart").lean()
    }

    async update(id, hashedPassword) {
        return await userModel.findByIdAndUpdate(id, { password: hashedPassword }, { runValidators: true, returnDocument: "after" })
    }

    async updateRol(id, nuevoRol) {
        return await userModel.findByIdAndUpdate(id, { rol: nuevoRol }, { runValidators: true, returnDocument: "after" })
    }

    async updateUser (uid, update) {
        try {
            const user = await userModel.findByIdAndUpdate(uid, update, { new: true });
            if (!user) {
                throw new Error("Usuario no encontrado.");
            }
            return user;
        } catch (error) {
            throw new Error(error.message);
        }
    };


    async deleteUserByEmail(userEmail) {
        try {
            return await userModel.deleteOne({ email: userEmail });
        } catch (error) {
            throw new Error("Error al eliminar usuario");
        }
    }

}
