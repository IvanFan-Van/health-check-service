import { Service } from "./src/service.js";
import express from "express";
import * as dotenv from "dotenv";
import { loadConfig } from "./src/loadConfig.js";
import ServiceConfig from "./src/interfaces/serviceConfig.js";
dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3003;

app.get("/services", (req, res) => {
	res.json(services.map((service) => service.toJSON()));
});

app.get("/services/:id", (req, res) => {
	const service = services.find((service) => service.id === req.params.id);
	if (!service) {
		return res.status(404).json({
			message: "Service not found",
		});
	}
	res.json(service.toJSON());
});

app.get("/services/:serviceId/tasks", (req, res) => {
	const service = services.find((service) => service.id === req.params.serviceId);
	if (!service) {
		return res.status(404).json({
			message: "Service not found",
		});
	}
	res.json(service.getTasks());
});

app.get("/services/:serviceId/tasks/:taskId", (req, res) => {
	const service = services.find((service) => service.id === req.params.serviceId);
	if (!service) {
		return res.status(404).json({
			message: "Service not found",
		});
	}
	const task = service.getTask(req.params.taskId);
	if (!task) {
		return res.status(404).json({
			message: "Task not found",
		});
	}
	res.json(task.toJSON());
});

app.get("/services/:serviceId/status", (req, res) => {
	const service = services.find((service) => service.id === req.params.serviceId);
	if (!service) {
		return res.status(404).json({
			message: "Service not found",
		});
	}
	res.json(service.getAllStatus());
});

// app.post("/services/:serviceId/tasks", (req, res) => {
// 	const service = services.find(
// 		(service) => service.id === req.params.serviceId
// 	);
// 	if (!service) {
// 		return res.status(404).json({
// 			message: "Service not found",
// 		});
// 	}
// 	const task = service.createTask(req.body);
// 	res.json(task.toJSON());
// });

// app.put("/services/:serviceId/tasks/:taskId", (req, res) => {
// 	const service = services.find(
// 		(service) => service.id === req.params.serviceId
// 	);
// 	if (!service) {
// 		return res.status(404).json({
// 			message: "Service not found",
// 		});
// 	}
// 	const task = service.updateTask(req.params.taskId, req.body);
// 	res.json(task.toJSON());
// });

// app.delete("/services/:serviceId/tasks/:taskId", (req, res) => {
// 	const service = services.find(
// 		(service) => service.id === req.params.serviceId
// 	);
// 	if (!service) {
// 		return res.status(404).json({
// 			message: "Service not found",
// 		});
// 	}
// 	const task = service.deleteTask(req.params.taskId);
// 	if (!task) {
// 		return res.status(404).json({
// 			message: "Task not found",
// 		});
// 	}
// 	res.json(task.toJSON());
// });

app.listen(PORT, () => {
	console.log(`Server is running at localhost: ${PORT}`);
});

const serviceConfigs: ServiceConfig[] = loadConfig();

let services = serviceConfigs.map((serviceConfig: ServiceConfig) => {
	return new Service(serviceConfig);
});
