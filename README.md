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

### Install Docker

(docker download)[https://docs.docker.com/engine/install/centos/]

### docker container register (https://ap-southeast-1.console.aws.amazon.com/ecr/private-registry/repositories?region=ap-southeast-1)

1. Retrieve an authentication token and authenticate your Docker client to your registry.
   Use the AWS CLI:

```bash
aws ecr get-login-password --region ap-southeast-1 | docker login --username AWS --password-stdin 526328749940.dkr.ecr.ap-southeast-1.amazonaws.com
```

**remark**:
在一台新机器上需要配置使用 `aws configure` 命令配置基础信息
access key ID && secret access key 都从这里获取 "D:\密码\aws.txt"

1. Build your Docker image using the following command. For information on building a Docker file from scratch see the instructions here . You can skip this step if your image is already built:

```bash
docker build -t health-check-service .
```

3. After the build completes, tag your image so you can push the image to this repository:

```bash
docker tag health-check-service:latest 526328749940.dkr.ecr.ap-southeast-1.amazonaws.com/health-check-service:latest
```

remark: 重命名从 aws 官网找, 创建仓库后点击 push command 来查看

4. Run the following command to push this image to your newly created AWS repository:

```bash
docker push 526328749940.dkr.ecr.ap-southeast-1.amazonaws.com/health-check-service:latest
```

### Dockerfile Config

FROM [docker_image]: 基础 docker 镜像, 你的项目搭建于哪个之上? 比如 node
`FROM node:alpine`

官方解释: The FROM instruction initializes a new build stage and sets the base image for subsequent instructions. As such, a valid Dockerfile must start with a FROM instruction. The image can be any valid image.
`FROM [--platform=<platform>] <image>[:<tag>] [AS <name>]`

WORKDIR [DIR]: 指定 docker 镜像的工作目录, 一般指定 /app
`WORKDIR /app`

官方解释: The WORKDIR instruction sets the working directory for any RUN, CMD, ENTRYPOINT, COPY and ADD instructions that follow it in the Dockerfile. If the WORKDIR doesn't exist, it will be created even if it's not used in any subsequent Dockerfile instruction.

COPY [local_path] [image_path]: 将 local_path 下的所有文件拷贝到 docker 镜像的 image_path 下
`COPY . /app` 将当前目录全部拷贝到 image 的/app 下

官方解释: The COPY instruction copies new files or directories from <src> and adds them to the filesystem of the container at the path <dest>.

RUN [command]: 在 docker 镜像内执行一个命令, 一般用于下载依赖以及初始化等操作
`RUN npm install`

官方解释: The RUN instruction will execute any commands to create a new layer on top of the current image. The added layer is used in the next step in the Dockerfile.

EXPOSE [PORT]: 项目暴露端口
`EXPOSE 3003`

官方解释: The EXPOSE instruction informs Docker that the container listens on the specified network ports at runtime. You can specify whether the port listens on TCP or UDP, and the default is TCP if you don't specify a protocol.

CMD [command]: docker 容器起来后运行的命令, 入口命令, 一般用于启动项目
`CMD["npm", "start"]`

官方解释: The CMD instruction sets the command to be executed when running a container from an image. There can only be one CMD instruction in a Dockerfile. If you list more than one CMD, only the last one takes effect.
`CMD ["executable","param1","param2"]`

### Docker 镜像创建

```bash
docker run -d -p 3003:3003 --name health-check-service adfou23412n
```

-d: detached 模式, 后台运行
-p [localhost_port]:[container_port]: 将本机端口和容器端口做一个映射
--name [name]: 命名该容器
docker run [image_id]: 从一个镜像创建并启动一个新容器
