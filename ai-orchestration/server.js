import 'dotenv/config';
import app from "./src/app";

app.listen(3000,()=>{
    console.log("ai-orchestration server is up and running on port 3000");
})