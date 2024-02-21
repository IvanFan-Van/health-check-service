export default class LogRequest {
    constructor(request) {
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
