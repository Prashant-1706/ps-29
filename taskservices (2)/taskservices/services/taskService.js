import Tasks from "../models/tasks.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import * as vectorService from "./vectorService.js";
dotenv.config();

const SECRETE_KEY = process.env.SECRETE_KEY;

// Create Task
export async function createTask(data, token) {
    try {
        const payload = jwt.verify(token, SECRETE_KEY);

        data.createdby = payload.crid;
        data.vector = await vectorService.generateVector(data.title + " " + data.description);
        await Tasks.create(data);

        return {
            code: 200,
            message: "New task has been created"
        };

    } catch (e) {
        return {
            code: 500,
            message: e.message
        };
    }
}

// Get All Tasks with Pagination
export async function getAllTasks(PAGE, SIZE, token) {
    try {
        const payload = jwt.verify(token, SECRETE_KEY);

        const page = Number(PAGE);
        const size = Number(SIZE);

        if (isNaN(page) || isNaN(size) || page <= 0 || size <= 0) {
            return {
                code: 400,
                message: "Invalid page or size value",
                page: 1,
                size: 0,
                totalrecords: 0,
                totalpages: 0,
                tasks: []
            };
        }

        const skip = (page - 1) * size;

        const tasks = await Tasks.find({ createdby: payload.crid })
            .sort({ createdat: -1 })
            .skip(skip)
            .limit(size);

        const totalrecords = await Tasks.countDocuments({
            createdby: payload.crid
        });

        return {
            code: 200,
            message: "Tasks fetched successfully",
            page: page,
            size: size,
            totalrecords: totalrecords,
            totalpages: Math.ceil(totalrecords / size),
            tasks: tasks
        };

    } catch (e) {
        return {
            code: 500,
            message: e.message,
            page: 1,
            size: 0,
            totalrecords: 0,
            totalpages: 0,
            tasks: []
        };
    }
}

// Vector/Search Task
export async function vectorSearch(key, token)
{
    let response;
    try
    {
        const payload = jwt.verify(token, SECRETE_KEY);

        const searchVector = await vectorService.generateVector(key);

        const tasks = await Tasks.find({createdby: payload.crid})

        const tasksData = tasks.map((task)=>{
            const similarity = vectorService.cosineSimilarity(searchVector, task.vector);
            console.log(task.title, similarity);
            return {...task._doc, similarity};
        })
        .filter((task)=>task.similarity > 0.10)
        .sort((a,b)=>b.similarity - a.similarity)
        .slice(0,5);

        response = {code: 200, tasks: tasksData};
    }catch(e)
    {
        response = {code: 500, message: e.message};
    }
    return response;
}

// Get Single Task
export async function getTask(id, token) {
    try {
        const payload = jwt.verify(token, SECRETE_KEY);

        const task = await Tasks.findOne({
            _id: id,
            createdby: payload.crid
        });

        if (!task) {
            return {
                code: 404,
                message: "Task not found"
            };
        }

        return {
            code: 200,
            message: "Task fetched successfully",
            task: task
        };

    } catch (e) {
        return {
            code: 500,
            message: e.message
        };
    }
}

// Update Task
export async function updateTask(id, data, token) {
    try {
        const payload = jwt.verify(token, SECRETE_KEY);

        delete data.createdby;
        delete data._id;
        delete data.id;
        data.vector = await vectorService.generateVector(data.title + " " + data.description);
        const result = await Tasks.findOneAndUpdate(
            {
                _id: id,
                createdby: payload.crid
            },
            data,
            { new: true }
        );

        if (!result) {
            return {
                code: 404,
                message: "Task not found or not allowed to update"
            };
        }

        return {
            code: 200,
            message: "Task updated successfully"
        };

    } catch (e) {
        return {
            code: 500,
            message: e.message
        };
    }
}

// Delete Task
export async function deleteTask(id, token) {
    try {
        const payload = jwt.verify(token, SECRETE_KEY);

        const result = await Tasks.findOneAndDelete({
            _id: id,
            createdby: payload.crid
        });

        if (!result) {
            return {
                code: 404,
                message: "Task not found or not allowed to delete"
            };
        }

        return {
            code: 200,
            message: "Task has been deleted"
        };

    } catch (e) {
        return {
            code: 500,
            message: e.message
        };
    }
}