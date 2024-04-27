# 使用官方 Node.js 镜像作为基础镜像
FROM node:latest

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json 文件到工作目录
COPY ./nodeapps/blockland/package*.json ./

# 安装依赖
RUN npm install

# 复制所有文件到工作目录
COPY . .

# 暴露容器端口
EXPOSE 3000

# 启动应用
CMD ["sh", "-c", "cd nodeapps/blockland/ && node app.js"]
