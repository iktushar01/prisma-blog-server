import express, { Application } from 'express';
import { postRouter } from './modules/post/post.router';
import { toNodeHandler } from "better-auth/node";
import { auth } from './lib/auth';
import cors from 'cors';
const app:Application = express();

app.use(cors({
    origin: process.env.TRUSTED_ORIGINS?.split(","),
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}))

app.use("/api/auth", toNodeHandler(auth));

app.use(express.json());

app.use("/posts", postRouter);

app.get('/', (req, res) => {
    res.send('Welcome to the Prisma Blog App Server!');
});

export default app;