import { Router } from "express";
import { db } from "../utils/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const authRouter = Router();

// 🐨 Todo: Exercise #1
// ให้สร้าง API เพื่อเอาไว้ Register ตัว User แล้วเก็บข้อมูลไว้ใน Database ตามตารางที่ออกแบบไว้
authRouter.post("/register", async (req, res) => {
    try {
        const user = {
            username: req.body.username,
            password: req.body.password,
            firstName: req.body.firstName,
            lastName: req.body.lastName
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);

        const collention = db.collection("users");
        await collention.insertOne(user);

        return res.status(200).json({
            message: "User has been created successfully",
        });
    } catch (error) {
        return res.status(500).json({ message: `Error: ${error.message}`, });
    }

});

// 🐨 Todo: Exercise #3
// ให้สร้าง API เพื่อเอาไว้ Login ตัว User ตามตารางที่ออกแบบไว้
authRouter.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body ?? {};

        const user = await db.collection("users").findOne({ username });
        if (!user) {
            return res.status(404).json({
                message: "User not found.",
            });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({
                message: "Invalid username or password.",
            });
        }

        // { id: user._id, firstName: user.firstName, lastName: user.lastName }
        const token = jwt.sign(
            {
                sub: user._id.toString(),
                firstName: user.firstName,
                lastName: user.lastName,
                username: user.username,
            },
            process.env.SECRET_KEY || "dev-secret",
            {
                expiresIn: '15m',
            }
        );

        return res.status(200).json({
            message: "Login successfully",
            token,
        });

    } catch (error) {
        return res.status(500).json({ message: `Server error: ${error.message}`, });
    }

});

export default authRouter;
