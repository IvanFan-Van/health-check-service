import {
	Config,
	Strategy,
	StrategyFactory,
} from "./strategies/strategyFactory";

export class Endpoint {
	public url: string;
	private strategy: Strategy;

	constructor(config: Config) {
		this.strategy = StrategyFactory.createStrategy(config);
		this.url = config.url;
	}

	checkHealth(): Promise<boolean> {
		return this.strategy.checkHealth();
	}
}
