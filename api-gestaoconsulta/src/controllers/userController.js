import userService from "../services/userService.js";

class UserController {

    async create(req, res, next) {
        try {
            const user = await userService.create(req.body);
            return res.status(201).json(user);
        } catch (error) {
            next(error);
        }
    }

    async findAll(req, res, next) {
        try {
            const users = await userService.findAll(req.query);
            return res.status(200).json(users);
        } catch (error) {
            next(error);
        }
    }

    async findById(req, res, next) {
        try {
            const user = await userService.findById(req.params.id);
            return res.status(200).json(user);
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const user = await userService.update(
                req.params.id,
                req.body
            );

            return res.status(200).json(user);

        } catch (error) {
            next(error);
        }
    }

    async delete(req, res, next) {
        try {
            await userService.delete(req.params.id);

            return res.status(200).json({
                message: "Usuário deletado com sucesso"
            });

        } catch (error) {
            next(error);
        }
    }
}

export default new UserController();