const { default: axios } = require("axios");
const winston = require("winston");

const ignoreInfo = winston.format((info, opts) => {
	if (info.level !== "error") {
		return false;
	}
	return info;
});

const logger = winston.createLogger({
	format: winston.format.combine(
		winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
		winston.format.printf((info) => {
			return `My Description before the message: \n${JSON.stringify(
				info,
				null,
				2
			)}`;
		})
	),
	transports: [
		new winston.transports.Console({
			level: "error",
			format: winston.format.combine(ignoreInfo()),
		}),
		// new winston.transports.File({ filename: "temp.log" }),
	],
});

// logger.error({
// 	message: "Hello World!",
// 	additional: {
// 		url: "http://example.com",
// 		headers: {
// 			"x-request-id": "1234567890",
// 		},
// 		body: {
// 			foo: "bar",
// 		},
// 		method: "GET",
// 	},
// });

const customLogger = winston.createLogger({
	format: winston.format.combine(
		winston.format.timestamp({ format: "YYYY-MM-DD hh:mm:ss" }),
		winston.format.printf((info) => {
			return `This is a new log: \n ${JSON.stringify(info, null, 2)}`;
		})
	),
	transports: [new winston.transports.Console()],
});

axios({
	url: "http://localhost:8000/api/v1",
	method: "get",
	headers: null,
	data: null,
})
	.then((res) => {
		customLogger.info({
			description: `Health check for ${this.method} ${this.url}  ${res.status} is successful`,
			request: {
				url: "http://localhost:8000/api/v1",
				method: "get",
				headers: null,
				data: null,
			},
			response: {
				status: res.status,
			},
		});
	})
	.catch((err) => {
		customLogger.error({
			description: `Health check for ${this.method} ${this.url}  ${err.response.status} is failed`,
			request: {
				url: "http://localhost:8000/api/v1",
				method: "get",
				headers: null,
				data: null,
			},
			response: {
				status: err.response.status,
				data: err.response.data,
			},
		});
	});
