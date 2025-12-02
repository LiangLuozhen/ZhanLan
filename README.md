# 2.0

## 📌 项目概述

本次重构旨在将后端服务适配全新的数据库表结构。原数据库表 `exhibitions` 已变更为 `zhanlan`，并新增了多个字段及状态管理逻辑。

**主要变更目标：**
1.  将数据访问层从 `exhibitions` 表切换至 `zhanlan` 表。
2.  适配新的字段名（`start_time`, `end_time`）和新增字段（`province`, `status`）。
3.  利用数据库的 `status` 状态字段优化查询逻辑。
4.  增加按省份和状态查询的新API端点。

## 🔄 核心代码变更

以下对比展示了旧版 (`kanzhan.js`) 和重构后代码的核心区别：

**1. 数据库查询表变更**
*   **旧版代码**：查询 `exhibitions` 表
    ```javascript
    const [rows] = await pool.query('SELECT * FROM exhibitions');
    ```
*   **新版代码**：查询 `zhanlan` 表，并映射字段别名以保持接口兼容[citation:1]
    ```javascript
    const [rows] = await pool.query(`
      SELECT id, name, 
             start_time AS start_date, 
             end_time AS end_date, 
             province, city, ... 
      FROM zhanlan
    `);
    ```

**2. 新增“省份”查询接口**
*   **新增端点**：`GET /api/exhibitions/province/:province`
*   **功能**：根据省份字段过滤展览信息。

**3. 新增“状态”查询接口**
*   **新增端点**：`GET /api/exhibitions/status/:status`
*   **功能**：根据状态码（0未开始，1进行中，2已结束）过滤展览。
*   **优化**：原“当前展览”端点改为直接查询 `status = 1`，逻辑更清晰。

**4. 返回数据结构增强**
*   **新增字段**：在所有展览查询中，除了返回数字类型的 `status`，还额外返回了易于理解的 `status_text`（中文状态描述）。

## 🚀 快速开始

### 前置条件
1.  **数据库**：已按照 `zhanlan.sql` 文件完成数据库和表的创建。
2.  **Node.js环境**：确保已安装 Node.js 和 npm。
3.  **依赖安装**：在项目目录下执行 `npm install express mysql2 cors`。

### 运行服务
1.  将重构后的 `kanzhan.js` 文件放置于你的项目目录。
2.  在终端中运行：
    ```bash
    node kanzhan.js
    ```
3.  看到“成功连接到数据库”和“后端服务已启动”的日志后，服务即运行在 `http://127.0.0.1:3000`。

## 📡 API 接口列表

服务启动后，可通过以下接口访问数据：

**基础信息**
*   `GET /api/health` - 服务健康检查

**展览数据查询**
*   `GET /api/exhibitions` - 获取所有展览
*   `GET /api/exhibitions/:id` - 根据ID获取展览详情
*   `GET /api/exhibitions/city/:city` - 根据城市获取展览
*   `GET /api/exhibitions/province/:province` - **【新增】** 根据省份获取展览
*   `GET /api/exhibitions/status/:status` - **【新增】** 根据状态获取展览 (0,1,2)
*   `GET /api/exhibitions/current` - 获取当前进行中的展览 (状态为1)
