## Documentation

### Overview

The service health check system is designed to periodically check the health of various services. It uses different strategies to check the health of different types of services, such as HTTP, WebSocket, and EventStream services.

### Components

- **Config**: This is an interface that defines the configuration for a service. It includes the type of the service (e.g., 'http', 'websocket', 'eventstream'), the URL of the service, and the schedule for the health check (in cron format).

- **Strategy**: This is an interface that defines a strategy for checking the health of a service. It includes a single method, `checkHealth()`, which returns a promise that resolves to a boolean indicating whether the service is healthy.

- **StrategyFactory**: This is a class that creates a strategy based on a given Config. It uses the 'type' property of the Config to determine which type of strategy to create.

- **Endpoint**: This is a class that represents a service endpoint. It uses a Strategy to check the health of the service.

- **HealthCheckTask**: This is a class that represents a health check task. It uses an Endpoint and a schedule to periodically check the health of the service and log the result.

- **Service**: This is a class that manages multiple health check tasks. It provides methods to get all tasks, create a new task, and update an existing task.

### Config File

The config file is a JSON file that contains an array of Config objects. Here's an example:

```json
[
	{
		"type": "http",
		"url": "http://example.com",
		"schedule": "* * * * *"
	},
	{
		"type": "websocket",
		"url": "ws://example.com",
		"schedule": "*/5 * * * *"
	}
]
```

In this example, the system will check the health of `http://example.com` every minute using the HTTP strategy, and the health of `ws://example.com` every 5 minutes using the WebSocket strategy.

### How Components Rely on Each Other

The Service class is the main entry point of the system. It uses the Config objects from the config file to create HealthCheckTask objects. Each HealthCheckTask uses an Endpoint, which in turn uses a Strategy created by the StrategyFactory based on the Config.

### Running the System

To run the system, compile the TypeScript files into JavaScript using the TypeScript compiler (`tsc`), and then run the compiled JavaScript code with Node.js (`node dist/index.js`). You can automate this process using npm scripts, a build tool like webpack or gulp, or a task runner like Grunt or Gulp.
