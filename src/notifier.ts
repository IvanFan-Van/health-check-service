import { loadNotifyConfig } from "./loadConfig.js";
import { logger } from "./logger.js";
import axios from "axios";

export class Notifier {
	private static instance: Notifier;
	users: Object[] = loadNotifyConfig();
	private constructor() {}

	static getInstance() {
		if (!this.instance) {
			this.instance = new Notifier();
		}
		return this.instance;
	}

	// Fetch open ID by phone number
	// getOpenId(phoneNumber: string): Promise<string> {
	// 	return this.getAuthenticationToken()
	// 		.then((token) => {
	// 			return axios({
	// 				url: `https://open.feishu.cn/open-apis/user/v1/batch_get_id`,
	// 				method: "get",
	// 				params: {
	// 					mobiles: phoneNumber,
	// 				},
	// 				headers: {
	// 					Authorization: `Bearer ${token}`,
	// 					"Content-Type": "application/json; charset=utf-8",
	// 				},
	// 			})
	// 				.then((res) => {
	// 					const openId = res.data.data["mobile_users"][phoneNumber][0]["open_id"];
	// 					return openId;
	// 				})
	// 				.catch((err) => {
	// 					logger.error({
	// 						message: `Failed to get OpenID with error ${err.message}`,
	// 						obj: err.response.data,
	// 						stack: err.stack,
	// 					});
	// 					throw err;
	// 				});
	// 		})
	// 		.catch((err) => {
	// 			throw err;
	// 		});
	// }
	// get authentication token
	getAuthenticationToken() {
		const APPID = process.env.APPID;
		const APPSECRET = process.env.APPSECRET;
		return axios({
			url: `https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal/`,
			method: "post",
			data: { app_id: APPID, app_secret: APPSECRET },
			headers: {
				"Content-Type": "application/json",
			},
		})
			.then((res) => {
				const { tenant_access_token } = res.data;
				return tenant_access_token;
			})
			.catch((err) => {
				logger.error({
					message: `Failed to get authentication token with error ${err.message}`,
					obj: err.response.data,
					stack: err.stack,
				});
				throw err;
			});
	}
	// Send message to user
	notify(message: string) {
		this.users.forEach((user: any) => {
			const openid = user.openid;
			this.getAuthenticationToken().then((token) => {
				axios({
					url: `https://open.feishu.cn/open-apis/im/v1/messages`,
					method: "post",
					data: {
						receive_id: openid,
						msg_type: "text",
						content: JSON.stringify({
							text: message,
						}),
					},
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json; charset=utf-8",
					},
					params: {
						receive_id_type: "open_id",
					},
				}).catch((err) => {
					logger.error({
						message: `Failed to send message with error ${err.message}`,
						obj: err.response.data,
						stack: err.stack,
					});
					return;
				});
			});
		});
	}
}
