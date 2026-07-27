import express from 'express';
import morgan from 'morgan';
import fs from 'fs';

const workingDirectory='/workspace';

const app=express();
app.use(morgan('dev'));
app.use(express.json());

app.get('/',(req,res)=>{
    res.status(200).json({
        message:"hello from sandbox agents",
        status:"success"
    });
})

app.get('/list-files',async (req,res)=>{
    const files=await fs.promises.readdir(workingDirectory);
    res.status(200).json({
        message:"list of files in working directory",
        status:"success",
        data:files
    });
})

export default app;

