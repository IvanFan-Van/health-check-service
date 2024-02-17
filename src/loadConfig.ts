import { createRequire } from "module";

export function loadConfig() {
	const require = createRequire(import.meta.url);
	const data = require("../config/services.json");
	data.forEach((service: any) => {
		service.configs.forEach((config: any) => {
			if (config.validator) {
				config.validator = eval(`(${config.validator})`);
			}
		});
	});
	return data;
}

export function updateConfig(config: any) {
	const require = createRequire(import.meta.url);
	const data = require("./config/services.json");
	data.push(config);
	return data;
}
