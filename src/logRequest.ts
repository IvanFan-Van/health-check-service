export default class LogRequest {
	public url: string;
	public method: string;
	public headers: any;
	public body: any;
	constructor(request: Request) {
		this.url = request.url;
		this.method = request.method;
		this.headers = request.headers;
		this.body = request.body;
	}

	toJSON() {
		return {
			url: this.url,
			method: this.method,
			headers: this.headers,
			body: this.body,
		};
	}
}
