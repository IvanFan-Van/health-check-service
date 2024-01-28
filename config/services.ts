export default [
	{
		serviceName: "树洞API",
		checkpoints: [
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
				schedule: "0 * * * *",
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
];
