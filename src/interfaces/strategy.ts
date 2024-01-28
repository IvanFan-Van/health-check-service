export default interface Strategy {
	checkHealth(): Promise<string>;
}
