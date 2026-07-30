import axios from "axios";
import {tool} from "langchain";
import * as z from "zod";

export const listFiles=tool(
    async({})=>{
        const response=await axios.get("http:///list-files");
        return JSON.stringify(response.data.files);
    },
    {
        name:"list-files",
        description:"list all files in the vite template project",
        inputSchema:z.object({})
    }

)

export const readFile=tool(
    async({files:[]})=>{
        const response=await axios.get("http:///read-file?files="+file.join(","))
        return JSON.stringify(response.data);
    },
    {
        name:"read-file",
        description:"read the content of specified files",
        inputSchema:z.object({
            files:z.array(z.string()).describe("the list of files absolute paths to read. these should be files that were listed using the list_files tool or created later")
        })
    }
)

export const updateFiles=tool(
    async({files})=>{
        const response=await axios.patch("http:///write-files",{
            update:files
        })
        return JSON.stringify(response.data.results);
    },
    {
        name:"update_files",
        description:"update the content of specified files this is useful for updating the content of files based on the requirement of the task at hand",
        inputSchema:z.object({
            files:z.array(z.object({
                filepath:z.string().describe("the absolute path of the file to update"),
                content:z.string().describe("the new content for the file")
            }))
        })
    }
)

export const createFile=tool(
    async (files)=>{
        await axios.post("http:///create-files",{
            files:files
        })
        return "files created successfully"
    },
    {
        name:"create_files",
        description:"create new files with the specified content. this is useful for creating new files based on the requirement of the task at hand",
        inputSchema:z.object({
            files:z.array(z.object({
                file:z.string().describe("the absolute path of the file to create"),
                content:z.string().describe("the content for the new file")
            }))
        })
    }
)