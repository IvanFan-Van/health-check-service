import { createRequire } from "module";
const require = createRequire(import.meta.url);

function loadNotifyConfig() {
	return require("./config/feishu_notify.json");
}

const users = loadNotifyConfig();
console.log(users);
