import ServiceConfig from "../src/interfaces/serviceConfig";

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
				type: "eventstream",
				url: "https://chat.tripleuni.com/?question=hello&token=xxx&histroy=[]",
				schedule: "* * * * * *",
			},
		],
	},
] as ServiceConfig[];
