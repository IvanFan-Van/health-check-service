import { logger } from "./logger";
import axios from "axios";

export class Notifier {
	private phoneNumber: string;
	private openId: string | null = null;

	constructor(phoneNumber: string) {
		this.phoneNumber = phoneNumber;
	}

	async init() {
		try {
			this.openId = await this.getOpenId(this.phoneNumber);
		} catch (err) {
			this.openId = null;
		}
	}

	// Fetch open ID by phone number
	getOpenId(phoneNumber: string): Promise<string> {
		return this.getAuthenticationToken()
			.then((token) => {
				return axios({
					url: `https://open.feishu.cn/open-apis/user/v1/batch_get_id`,
					method: "get",
					params: {
						mobiles: phoneNumber,
					},
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json; charset=utf-8",
					},
				})
					.then((res) => {
						const openId =
							res.data.data["mobile_users"][phoneNumber][0]["open_id"];
						return openId;
					})
					.catch((err) => {
						logger.error({
							message: `Failed to get OpenID with error ${err.message}`,
							obj: err.response.data,
							stack: err.stack,
						});
						throw err;
					});
			})
			.catch((err) => {
				throw err;
			});
	}
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
		if (!this.openId) {
			logger.info(`No OpenID found for phone number ${this.phoneNumber}`);
			return;
		}
		this.getAuthenticationToken().then((token) => {
			axios({
				url: `https://open.feishu.cn/open-apis/im/v1/messages`,
				method: "post",
				data: {
					receive_id: this.openId,
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
	}
}
