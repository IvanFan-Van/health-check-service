import { createRequire } from "module";
const require = createRequire(import.meta.url);

export function loadConfig() {
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

export function loadNotifyConfig() {
	return require("../config/feishu_notify.json");
}

export function updateConfig(config: any) {
	const require = createRequire(import.meta.url);
	const data = require("./config/services.json");
	data.push(config);
	return data;
}
