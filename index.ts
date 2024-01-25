import { Service } from "./src/service";
import express from "express";
import endpointsConfig from "./config/endpointConfig.json";

const app = express();
app.use(express.json());

const PORT = 3003;
app.listen(PORT, () => {
	console.log(`Server is running at localhost: ${PORT}`);
});

const service = new Service(endpointsConfig);
service.startHealthChecks();
