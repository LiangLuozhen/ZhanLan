# 展览管理系统 API 文档

## 概述

展览管理系统提供中英文双语API接口，支持展览信息的查询、筛选、搜索等功能。所有数据来源于 MySQL 数据库 `exhibition_db` 中的 `zhanlan` 表，包含 5 个展览的完整中英文信息。

---

## 基础信息

- **基础URL**: `http://127.0.0.1:3000`
- **API版本**: v1
- **支持的语言**: 中文 (cn) / 英文 (en)
- **数据格式**: JSON
- **字符编码**: UTF-8

---

## API 接口列表

### 1. 获取所有展览

**中文**: `GET /api/cn/exhibitions`  
**英文**: `GET /api/en/exhibitions`

支持分页、排序和组合筛选。

#### 请求参数（Query String）

| 参数名   | 类型    | 必填 | 说明                                                     | 示例               |
| -------- | ------- | ---- | -------------------------------------------------------- | ------------------ |
| province | string  | 否   | 省份（中文或英文）                                       | `江苏` / `Jiangsu` |
| city     | string  | 否   | 城市（中文或英文）                                       | `南京` / `Nanjing` |
| status   | integer | 否   | 状态码：0-未开始，1-进行中，2-已结束                     | `1`                |
| sort     | string  | 否   | 排序字段：`start_time`（默认），`end_time`，`created_at` | `start_time`       |
| order    | string  | 否   | 排序方向：`asc`（升序），`desc`（降序，默认）            | `desc`             |
| limit    | integer | 否   | 每页数量                                                 | `10`               |
| page     | integer | 否   | 页码（从1开始）                                          | `1`                |

#### 响应示例（中文）

```json
{
  "success": true,
  "count": 5,
  "language": "cn",
  "data": [
    {
      "id": 4,
      "name": "东方光影志——美术片《大闹天宫》跨媒介艺术展",
      "start_date": "2025-09-23",
      "end_date": "2026-01-06",
      "province": "江苏",
      "city": "南京",
      "location": "江苏省美术馆陈列馆",
      "introduction": "本次展览是美术片《大闹天宫》及其延展路径的集中呈现...",
      "picture_url": "https://...",
      "status": 1,
      "status_text": "进行中",
      "created_at": "2025-03-27T10:00:00.000Z",
      "updated_at": "2025-03-27T10:00:00.000Z"
    },
    ...
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "total_pages": 1
  }
}
```

#### 响应示例（英文）

```json
{
  "success": true,
  "count": 5,
  "language": "en",
  "data": [
    {
      "id": 4,
      "name": "Oriental Light and Shadow Chronicles - Cross Media Art Exhibition of the Art Film 'Chaos in the Heavenly Palace'",
      "start_date": "2025-09-23",
      "end_date": "2026-01-06",
      "province": "Jiangsu",
      "city": "Nanjing",
      "location": "Jiangsu Provincial Art Museum Exhibition Hall",
      "introduction": "This exhibition is a concentrated presentation of the art film...",
      "picture_url": "https://...",
      "status": 1,
      "status_text": "In Progress",
      "created_at": "2025-03-27T10:00:00.000Z",
      "updated_at": "2025-03-27T10:00:00.000Z"
    },
    ...
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "total_pages": 1
  }
}
```

---

### 2. 搜索展览

**中文**: `GET /api/cn/exhibitions/search`  
**英文**: `GET /api/en/exhibitions/search`

根据关键词模糊匹配展览名称和介绍。

#### 请求参数

| 参数名 | 类型   | 必填 | 说明       |
| ------ | ------ | ---- | ---------- |
| q      | string | 是   | 搜索关键词 |

#### 响应示例（中文）

```json
{
  "success": true,
  "count": 2,
  "language": "cn",
  "keyword": "水墨",
  "data": [
    {
      "id": 2,
      "name": "山花迷人眼——彭康隆水墨画展",
      "introduction": "当代重要的水墨艺术家彭康隆...",
      ...
    },
    ...
  ]
}
```

---

### 3. 获取展览详情

**中文**: `GET /api/cn/exhibitions/:id`  
**英文**: `GET /api/en/exhibitions/:id`

根据展览ID获取详细信息。

#### 路径参数

| 参数名 | 类型    | 说明           |
| ------ | ------- | -------------- |
| id     | integer | 展览ID（必填） |

#### 响应示例

```json
{
  "success": true,
  "language": "cn",
  "data": {
    "id": 1,
    "name": "面容与印迹：维姆·文德斯 × 罗伯特·博西西奥影像绘画双人展",
    "start_date": "2025-12-11",
    "end_date": "2026-03-15",
    "province": "浙江",
    "city": "杭州",
    "location": "浙江美术馆",
    "introduction": "一场关于影像与绘画的静谧对话...",
    "picture_url": "https://...",
    "status": 0,
    "status_text": "未开始",
    "created_at": "2025-03-27T10:00:00.000Z",
    "updated_at": "2025-03-27T10:00:00.000Z"
  }
}
```

---

### 4. 按省份查询

**中文**: `GET /api/cn/exhibitions/province/:province`  
**英文**: `GET /api/en/exhibitions/province/:province`

查询指定省份的所有展览。

#### 路径参数

| 参数名   | 类型   | 说明                   |
| -------- | ------ | ---------------------- |
| province | string | 省份名称（中文或英文） |

#### 请求示例

- 中文: `GET /api/cn/exhibitions/province/江苏`
- 英文: `GET /api/en/exhibitions/province/Jiangsu`

#### 响应示例

```json
{
  "success": true,
  "count": 3,
  "language": "cn",
  "province": "江苏",
  "data": [
    {
      "id": 4,
      "name": "东方光影志——美术片《大闹天宫》跨媒介艺术展",
      ...
    },
    ...
  ]
}
```

---

### 5. 按城市查询

**中文**: `GET /api/cn/exhibitions/city/:city`  
**英文**: `GET /api/en/exhibitions/city/:city`

查询指定城市的所有展览。

#### 路径参数

| 参数名 | 类型   | 说明                   |
| ------ | ------ | ---------------------- |
| city   | string | 城市名称（中文或英文） |

#### 请求示例

- 中文: `GET /api/cn/exhibitions/city/南京`
- 英文: `GET /api/en/exhibitions/city/Nanjing`

#### 响应示例

```json
{
  "success": true,
  "count": 2,
  "language": "cn",
  "city": "南京",
  "data": [
    {
      "id": 4,
      "name": "东方光影志——美术片《大闹天宫》跨媒介艺术展",
      ...
    },
    ...
  ]
}
```

---

### 6. 按状态查询

**中文**: `GET /api/cn/exhibitions/status/:status`  
**英文**: `GET /api/en/exhibitions/status/:status`

查询指定状态的展览。

#### 路径参数

| 参数名 | 类型    | 说明                                 |
| ------ | ------- | ------------------------------------ |
| status | integer | 状态码：0-未开始，1-进行中，2-已结束 |

#### 请求示例

- 中文: `GET /api/cn/exhibitions/status/1`
- 英文: `GET /api/en/exhibitions/status/1`

#### 响应示例

```json
{
  "success": true,
  "count": 3,
  "language": "cn",
  "status": "进行中",
  "status_code": "1",
  "data": [
    {
      "id": 2,
      "name": "山花迷人眼——彭康隆水墨画展",
      "status": 1,
      "status_text": "进行中",
      ...
    },
    ...
  ]
}
```

---

### 7. 获取筛选器选项

**中文**: `GET /api/cn/filters`  
**英文**: `GET /api/en/filters`

返回前端筛选器所需的省份列表、城市列表、状态选项及对应的展览数量。

#### 响应示例（中文）

```json
{
  "success": true,
  "language": "cn",
  "data": {
    "provinces": [
      { "value": "广东", "count": 2 },
      { "value": "江苏", "count": 3 },
      { "value": "浙江", "count": 1 }
    ],
    "cities": [
      { "value": "广州", "count": 2 },
      { "value": "杭州", "count": 1 },
      { "value": "南京", "count": 2 }
    ],
    "status": [
      { "value": "0", "label": "未开始", "count": 1 },
      { "value": "1", "label": "进行中", "count": 3 },
      { "value": "2", "label": "已结束", "count": 1 }
    ],
    "sort": [
      { "value": "start_time", "label": "开始时间" },
      { "value": "end_time", "label": "结束时间" },
      { "value": "created_at", "label": "创建时间" }
    ]
  }
}
```

#### 响应示例（英文）

```json
{
  "success": true,
  "language": "en",
  "data": {
    "provinces": [
      { "value": "Guangdong", "count": 2 },
      { "value": "Jiangsu", "count": 3 },
      { "value": "Zhejiang", "count": 1 }
    ],
    "cities": [
      { "value": "Guangzhou", "count": 2 },
      { "value": "Hangzhou", "count": 1 },
      { "value": "Nanjing", "count": 2 }
    ],
    "status": [
      { "value": "0", "label": "Upcoming", "count": 1 },
      { "value": "1", "label": "In Progress", "count": 3 },
      { "value": "2", "label": "Ended", "count": 1 }
    ],
    "sort": [
      { "value": "start_time", "label": "Start Time" },
      { "value": "end_time", "label": "End Time" },
      { "value": "created_at", "label": "Created Date" }
    ]
  }
}
```

---

### 8. 获取地理位置信息

**中文**: `GET /api/cn/locations`  
**英文**: `GET /api/en/locations`

返回按省份分组的展览列表，适用于地图或地区展示。

#### 响应示例（中文）

```json
{
  "success": true,
  "count": 5,
  "language": "cn",
  "data": [
    {
      "province": "广东",
      "exhibitions": [
        {
          "id": 2,
          "name": "山花迷人眼——彭康隆水墨画展",
          "city": "广州",
          "location": "广东美术馆新馆（白鹅潭）",
          "start_date": "2025-11-14",
          "end_date": "2026-03-08",
          "status": 1,
          "status_text": "进行中",
          "picture_url": "https://..."
        },
        {
          "id": 3,
          "name": "单凡艺术四十年",
          "city": "广州",
          "location": "广东美术馆新馆（白鹅潭）",
          "start_date": "2025-11-21",
          "end_date": "2026-03-01",
          "status": 1,
          "status_text": "进行中",
          "picture_url": "https://..."
        }
      ]
    },
    ...
  ]
}
```

---

## 公共字段说明

### 展览对象字段

| 字段名       | 类型     | 说明                                   |
| ------------ | -------- | -------------------------------------- |
| id           | integer  | 展览唯一标识                           |
| name         | string   | 展览名称（根据语言返回对应版本）       |
| start_date   | date     | 展览开始日期（YYYY-MM-DD）             |
| end_date     | date     | 展览结束日期（YYYY-MM-DD）             |
| province     | string   | 省份名称（根据语言返回对应版本）       |
| city         | string   | 城市名称（根据语言返回对应版本）       |
| location     | string   | 具体地点（根据语言返回对应版本）       |
| introduction | string   | 展览介绍（根据语言返回对应版本）       |
| picture_url  | string   | 展览图片URL                            |
| status       | integer  | 状态码（0-未开始，1-进行中，2-已结束） |
| status_text  | string   | 状态文本（根据语言返回对应翻译）       |
| created_at   | datetime | 记录创建时间（ISO 8601）               |
| updated_at   | datetime | 记录最后更新时间（ISO 8601）           |

---

## 错误处理

所有API在出错时返回统一格式的错误信息。

### 错误响应示例

```json
{
  "success": false,
  "error": "未找到展览",
  "message": "未找到江苏1省的展览信息",
  "suggestion": "请确认省份中文名是否正确（如：江苏、广东、浙江）"
}
```

### HTTP 状态码说明

| 状态码 | 说明                                       |
| ------ | ------------------------------------------ |
| 200    | 请求成功                                   |
| 400    | 请求参数错误（如无效状态值、缺少必填参数） |
| 404    | 资源不存在（如展览ID不存在、省份无数据）   |
| 500    | 服务器内部错误（数据库连接失败等）         |

---

## 前端集成示例

### 1. 语言管理

```javascript
// 用户偏好语言
let currentLang = localStorage.getItem('lang') || 'cn';

// 切换语言
function switchLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('lang', lang);
  location.reload(); // 刷新页面重新获取数据
}

// 获取API基础路径
function getApiBase() {
  return `/api/${currentLang}`;
}
```

### 2. 获取所有展览（带筛选）

```javascript
async function fetchExhibitions(filters = {}) {
  const params = new URLSearchParams(filters);
  const res = await fetch(`${getApiBase()}/exhibitions?${params}`);
  return res.json();
}

// 示例：获取江苏省进行中的展览
const data = await fetchExhibitions({
  province: currentLang === 'cn' ? '江苏' : 'Jiangsu',
  status: 1,
  limit: 10,
  page: 1
});
```

### 3. 搜索

```javascript
async function searchExhibitions(keyword) {
  const res = await fetch(`${getApiBase()}/exhibitions/search?q=${encodeURIComponent(keyword)}`);
  return res.json();
}

// 示例
const results = await searchExhibitions('水墨');
```

### 4. 加载筛选器选项

```javascript
async function loadFilters() {
  const res = await fetch(`${getApiBase()}/filters`);
  const { data } = await res.json();
  // 渲染省份、城市下拉框
  data.provinces.forEach(prov => {
    addOptionToSelect('#province', prov.value, `${prov.value} (${prov.count})`);
  });
  data.cities.forEach(city => {
    addOptionToSelect('#city', city.value, `${city.value} (${city.count})`);
  });
  // 渲染状态单选
  data.status.forEach(status => {
    addRadioButton('#status', status.value, status.label);
  });
}
```

---

## 附录

### 当前展览数据清单（ID 1-5）

| ID   | 中文名称                                                | 英文名称                                | 省份 | 城市 | 开始时间   | 结束时间   |
| ---- | ------------------------------------------------------- | --------------------------------------- | ---- | ---- | ---------- | ---------- |
| 1    | 面容与印迹：维姆·文德斯 × 罗伯特·博西西奥影像绘画双人展 | Faces and Marks: A Duo Exhibition...    | 浙江 | 杭州 | 2025-12-11 | 2026-03-15 |
| 2    | 山花迷人眼——彭康隆水墨画展                              | Enchanting Eyes of Mountain Flowers...  | 广东 | 广州 | 2025-11-14 | 2026-03-08 |
| 3    | 单凡艺术四十年                                          | Forty Years of Danfan Art               | 广东 | 广州 | 2025-11-21 | 2026-03-01 |
| 4    | 东方光影志——美术片《大闹天宫》跨媒介艺术展              | Oriental Light and Shadow Chronicles... | 江苏 | 南京 | 2025-09-23 | 2026-01-06 |
| 5    | 周京新：有鱼                                            | Zhou Jingxin: With Fish                 | 江苏 | 南京 | 2025-11-27 | 2025-12-21 |

---

