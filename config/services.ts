import * as dotenv from "dotenv";
dotenv.config();
import ServiceConfig from "../src/interfaces/serviceConfig.js";

export default [
	{
		serviceName: "树洞API",
		configs: [
			{
				type: "http",
				url: "https://api.tripleuni.com/v4/post/list/all.php",
				method: "POST",
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
				},
				body: {
					token: process.env.TOKEN,
				},
				schedule: "* * * * *",
				validator: (data) => {
					return data.code === 200;
				},
			},
			{
				type: "http",
				url: "https://api.tripleuni.com/v4/post/list/hot.php",
				method: "POST",
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
				},
				body: {
					token: process.env.TOKEN,
					uni_post_id: 304291,
				},
				schedule: "* * * * *",
				validator: (data) => {
					return data.code === 200;
				},
			},
			{
				type: "http",
				url: "https://api.tripleuni.com/v4/post/single/post.php",
				method: "POST",
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
				},
				body: {
					token: process.env.TOKEN,
					post_msg: "test",
					post_topic: "情感",
					user_is_real_name: true,
					post_public: 2,
					post_is_uni: true,
				},
				schedule: "* * * * *",
				validator: (data) => {
					return data.code === 200;
				},
			},
			{
				type: "http",
				url: "https://api.tripleuni.com/v4/post/list/search.php",
				method: "POST",
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
				},
				body: {
					token: process.env.TOKEN,
					key_word: "ECON1210",
					search_mode: "default",
				},
				schedule: "* * * * *",
				validator: (data) => {
					return data.code === 200;
				},
			},
		],
	},
	{
		serviceName: "Other",
		configs: [
			{
				type: "http",
				url: "https://upload.tripleuni.com/index.php?bucket=boatonland-1307992092&region=ap-beijing",
				method: "GET",
				schedule: "* * * * *",
				validator: (responseJson: any) => {
					if (responseJson.credentials.sessionToken) {
						return true;
					}
					return false;
				},
			},
			{
				type: "http",
				url: "https://i.boatonland.com/avatar/hkughost.svg",
				method: "GET",
				schedule: "* * * * *",
			},
			{
				type: "http",
				url: "https://tripleuni.com",
				method: "GET",
				schedule: "* * * * *",
			},
			{
				type: "http",
				url: "https://terms.tripleuni.com/hku/agreement/",
				method: "GET",
				schedule: "* * * * *",
			},
			{
				type: "websocket",
				url: "wss://ws.tripleuni.com:7230",
				body: {
					type: "bind",
					token: process.env.TOKEN,
				},
				schedule: "* * * * *",
				validator: (data) => {
					return JSON.stringify(data) === JSON.stringify({ type: "bind", bind_result: "success" });
				},
			},
			{
				type: "eventstream",
				url: `https://chat.tripleuni.com/?question=hello&token=${process.env.TOKEN}&histroy=[]`,
				schedule: "0 * * * *",
			},
		],
	},
	// {
	// 	serviceName: "simplest blog",
	// 	configs: [
	// 		{
	// 			type: "http",
	// 			url: "https://localhost:8000/api/v1",
	// 			method: "GET",
	// 			schedule: "*/10 * * * * *",
	// 		},
	// 		{
	// 			type: "http",
	// 			url: "https://localhost:8000/api/v1/cd4eb9f4-f617-490e-8135-a3b3d4874898",
	// 			method: "GET",
	// 			schedule: "*/10 * * * * *",
	// 		},
	// 		{
	// 			type: "http",
	// 			url: "https://localhost:8000/api/v1",
	// 			method: "POST",
	// 			schedule: "*/10 * * * * *",
	// 			data: {},
	// 		},
	// 		{
	// 			type: "http",
	// 			url: "https://localhost:8000/api/v1/333",
	// 			method: "PATCH",
	// 			schedule: "*/10 * * * * *",
	// 			data: {},
	// 		},
	// 		{
	// 			type: "http",
	// 			url: "https://localhost:8000/api/v1/444",
	// 			method: "DELETE",
	// 			schedule: "*/10 * * * * *",
	// 		},

	// 	],
	// },
] as ServiceConfig[];
