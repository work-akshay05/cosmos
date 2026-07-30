import {chatMistralAI} from "@langchain/mistralai";
import {listFiles,readFile,updateFiles,createFile} from "./tools.js";
import { createAgent } from "langchain";

const model=new chatMistralAI({
    model:"mistral-medium-latest",
    apikey:process.env.MISTRALAI_API_KEY,
})

const agent=createAgent({
    model:model,
    tools:[listFiles,readFile,updateFiles,createFile],

})

agent.invoke({
    message:[
        {
            role:"user",
            content:"update the theme of the project to light theme"
        }
    ]
})