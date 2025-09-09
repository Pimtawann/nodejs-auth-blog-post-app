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
        if (!username || !password) {
            return res.status(400).json({ message: "Username and Password are required." });
        }

        const user = await db.collection("users").findOne(
            { username: String(username).trim() },
            { projection: { _id: 1, username: 1, firstName: 1, lastName: 1, role: 1, password: 1 } }
        );

        if (!user || !user.password) {
            return res.status(401).json({ message: "User not found." });
        }

        const isValidPassword = await bcrypt.compare(String(password), user.password);
        if (!isValidPassword) {
            return res.status(401).json({
                message: "Invalid username or password.",
            });
        }

        // { id: user._id, firstName: user.firstName, lastName: user.lastName }
        const payload = {
            sub: user._id.toString(),
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role ?? "user",
        };

        const SECRET = process.env.SECRET_KEY;
        if (!SECRET) console.warn("SECRET_KEY is not set.");

        const token = jwt.sign(payload, SECRET || "dev-only-secret", {
            expiresIn: "15m",
            issuer: "auth-blog-post-app",
            audience: "auth-blog-post-client",
            jwtid: crypto.randomUUID?.() || `${Date.now()}`, //สำคัญ: ป้องกันทำซ้ำและแฮ็ก
        });

        return res.status(200).json({
            message: "Login successfully",
            token, //ห้ามลืมใส่ token
            user: {
                id: payload.sub,
                username: payload.username,
                firstName: payload.firstName,
                lastName: payload.lastName,
                role: payload.role,
            },
            expiresIn: "15d",
        });

    } catch (error) {
        return res.status(500).json({ message: `Server error: ${error.message}`, });
    }
});

export default authRouter;
