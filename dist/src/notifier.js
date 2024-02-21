import { loadNotifyConfig } from "./loadConfig.js";
import { createLogResponse, logError, logger } from "./logger.js";
import axios from "axios";
export class Notifier {
    constructor() {
        this.users = loadNotifyConfig();
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new Notifier();
        }
        return this.instance;
    }
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
            logger.error(`Failed to get authentication token with error ${err.message}`, {
                response: createLogResponse(err.response),
            });
            return null;
        });
    }
    notify(message) {
        this.users.forEach((user) => {
            const openid = user.openid;
            this.getAuthenticationToken().then((token) => {
                if (!token) {
                    logger.error("Failed to send message with error: failed to get token.");
                    return;
                }
                axios({
                    url: `https://open.feishu.cn/open-apis/im/v1/messages`,
                    method: "post",
                    data: {
                        receive_id: openid,
                        msg_type: "text",
                        content: JSON.stringify({
                            text: message || "empty message",
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
                    logger.error(`Failed to send message with error ${err.message}`, {
                        response: createLogResponse(err.response),
                    });
                    return;
                });
            });
        });
    }
    notifyChat(message) {
        const chat_id = process.env.CHAT_ID;
        this.getAuthenticationToken().then((token) => {
            if (!token) {
                logError({
                    message: "Failed to send message with error: failed to get token.",
                });
                return;
            }
            axios({
                url: `https://open.feishu.cn/open-apis/im/v1/messages`,
                method: "post",
                data: {
                    receive_id: chat_id,
                    msg_type: "text",
                    content: JSON.stringify({
                        text: message || "empty message",
                    }),
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json; charset=utf-8",
                },
                params: {
                    receive_id_type: "chat_id",
                },
            }).catch((err) => {
                console.log(err.response.data);
                logError({
                    message: `Failed to send message with error ${err.message}`,
                    response: err.response,
                });
                return;
            });
        });
    }
}
