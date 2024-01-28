export default interface Config {
	type: string;
	url: string;
	schedule: string;
	method?: string;
	headers?: Record<string, string>;
	body?: any;
}
