import { createRequire } from "module";
const require = createRequire(import.meta.url);
const data = require("./config/services.json");
data.forEach((service) => {
	service.configs.forEach((config) => {
		if (config.validator) {
			config.validator = eval(`(${config.validator})`);
		}
	});
});

export const test = 1;
