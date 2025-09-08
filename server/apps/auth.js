import { Router } from "express";
import { db } from "../utils/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const authRouter = Router();

authRouter.post("/register", async (req, res) => {
    const user = {
        username: req.body.username,
        password: req.body.password,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
    };

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);

    const Collection = db.collection("users");
    await Collection.insertOne(user);

    return res.json({
        message: "User has been created successfully"
    })

})

authRouter.post("/login", async (req, res) => {
    const user = await db.collection("users").findOne({
        username: req.body.username,
    })

    if (!user) {
        return res.status(401).json({
            message: "Invalid username or password"
        })
    }

    const isValidPassword = await bcrypt.compare(
        req.body.password,
        user.password
    );

    if (!isValidPassword) {
        return res.status(401).json({
            message: "password not valid"
        })
    }

    const token = jwt.sign(
        {id: user._id, firstName: user.firstName, lastName: user.lastName},
        process.env.SECRET_KEY,
        {
            expiresIn: "900000"
        }
    )

    return res.status(200).json({
        message: "login successfully", 
        token,
    })
})

export default authRouter;
