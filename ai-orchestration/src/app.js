import express from "express";
import morgan from "morgan";

const app=express();
app.use(morgan("dev"));
app.use(express.json());

app.get('/health-check',async (req,res)=>{
    res.status(200).json({
        message: "ai-orchestration is up",
    });
});

export default app;