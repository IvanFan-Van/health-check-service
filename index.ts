import { Service } from "./src/service";
import express from "express";
import endpointsConfig from "./config/endpointsConfig.json";
import * as dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3003;

app.get("/", (req, res) => {
	res.json(service.getTasks());
});

app.get("/:id", (req, res) => {
	res.json(service.getTask(req.params.id));
});

app.post("/", (req, res) => {
	const task = service.createTask(req.body);
	res.json(task);
});

app.put("/:id", (req, res) => {
	const newTask = service.updateTask(req.params.id, req.body);
	res.json(newTask);
});

app.delete("/:id", (req, res) => {
	const deletedTask = service.deleteTask(req.params.id);
	res.json(deletedTask);
});

app.listen(PORT, () => {
	console.log(`Server is running at localhost: ${PORT}`);
});

const service = new Service(endpointsConfig);
service.startHealthChecks();
