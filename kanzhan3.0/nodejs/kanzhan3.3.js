const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
const port = 3000;

// 中间件
app.use(cors());
app.use(express.json());

// 数据库配置
const dbConfig = {
  host: '127.0.0.1',
  user: 'root',
  password: '123456',
  database: 'exhibition_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// 创建数据库连接池
const pool = mysql.createPool(dbConfig);

// 简单的数据库连接测试
async function testDatabaseConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ 成功连接到数据库');

    // 测试简单查询
    const [result] = await connection.query('SELECT 1 + 1 AS solution');
    console.log(`📊 数据库测试查询结果: ${result[0].solution}`);

    connection.release();
    return true;
  } catch (err) {
    console.error('❌ 数据库连接失败:', err.message);
    return false;
  }
}

// 辅助函数：根据语言构建查询字段
function buildQueryFields(lang) {
  const fieldMap = {
    name: lang === 'en' ? 'name_en' : 'name_cn',
    province: lang === 'en' ? 'province_en' : 'province_cn',
    city: lang === 'en' ? 'city_en' : 'city_cn',
    location: lang === 'en' ? 'location_en' : 'location_cn',
    introduction: lang === 'en' ? 'introduction_en' : 'introduction_cn'
  };

  return `
    id,
    ${fieldMap.name} AS name,
    start_time AS start_date,
    end_time AS end_date,
    ${fieldMap.province} AS province,
    ${fieldMap.city} AS city,
    ${fieldMap.location} AS location,
    ${fieldMap.introduction} AS introduction,
    picture_url,
    status,
    CASE status
      WHEN 0 THEN '${lang === 'en' ? 'Upcoming' : '未开始'}'
      WHEN 1 THEN '${lang === 'en' ? 'In Progress' : '进行中'}'
      WHEN 2 THEN '${lang === 'en' ? 'Ended' : '已结束'}'
      ELSE '${lang === 'en' ? 'Unknown' : '未知'}'
    END AS status_text,
    created_at,
    updated_at
  `;
}

// API端点

// 健康检查端点
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: '后端服务运行正常',
    timestamp: new Date().toISOString(),
    database: 'exhibition_db',
    table: 'zhanlan',
    endpoints: [
      'GET /api/cn/exhibitions',
      'GET /api/en/exhibitions',
      'GET /api/cn/exhibitions/search',
      'GET /api/en/exhibitions/search',
      'GET /api/cn/exhibitions/:id',
      'GET /api/en/exhibitions/:id',
      'GET /api/cn/exhibitions/province/:province',
      'GET /api/en/exhibitions/province/:province',
      'GET /api/cn/exhibitions/city/:city',
      'GET /api/en/exhibitions/city/:city',
      'GET /api/cn/exhibitions/status/:status',
      'GET /api/en/exhibitions/status/:status',
      'GET /api/cn/filters',
      'GET /api/en/filters',
      'GET /api/cn/locations',
      'GET /api/en/locations'
    ]
  });
});

// ============ 中文API接口 ============

// 中文：获取所有展览（支持综合筛选）
app.get('/api/cn/exhibitions', async (req, res) => {
  const { province, city, status, limit, page = 1, sort = 'start_time', order = 'desc' } = req.query;

  try {
    let fields = buildQueryFields('cn');
    let query = `SELECT ${fields} FROM zhanlan`;
    let params = [];
    let conditions = [];

    // 动态构建查询条件
    if (province) {
      conditions.push(`province_cn = ?`);
      params.push(province);
    }

    if (city) {
      conditions.push(`city_cn = ?`);
      params.push(city);
    }

    if (status !== undefined && status !== '') {
      conditions.push(`status = ?`);
      params.push(status);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    // 排序
    const validSortFields = ['start_time', 'end_time', 'created_at', 'updated_at'];
    const validOrders = ['asc', 'desc'];
    const sortField = validSortFields.includes(sort) ? sort : 'start_time';
    const sortOrder = validOrders.includes(order.toLowerCase()) ? order.toUpperCase() : 'DESC';

    query += ` ORDER BY ${sortField} ${sortOrder}`;

    // 分页处理
    let limitValue = limit ? parseInt(limit) : null;
    let offsetValue = null;

    if (limitValue) {
      const pageNum = parseInt(page) || 1;
      offsetValue = (pageNum - 1) * limitValue;
      query += ` LIMIT ? OFFSET ?`;
      params.push(limitValue, offsetValue);
    }

    const [rows] = await pool.query(query, params);

    console.log(`✅ 成功获取 ${rows.length} 条展览记录（中文）`);

    // 获取总数用于分页
    let totalCount = 0;
    if (limitValue) {
      let countQuery = `SELECT COUNT(*) as total FROM zhanlan`;
      if (conditions.length > 0) {
        countQuery += ` WHERE ${conditions.join(' AND ')}`;
      }
      const [countResult] = await pool.query(countQuery, params.slice(0, -2)); // 移除LIMIT和OFFSET参数
      totalCount = countResult[0].total;
    }

    const response = {
      success: true,
      count: rows.length,
      language: 'cn',
      data: rows
    };

    // 添加分页信息
    if (limitValue) {
      response.pagination = {
        page: parseInt(page),
        limit: limitValue,
        total: totalCount,
        total_pages: Math.ceil(totalCount / limitValue)
      };
    }

    res.json(response);
  } catch (err) {
    console.error('❌ 数据库查询错误:', err);
    res.status(500).json({
      success: false,
      error: '数据库查询失败',
      message: err.message
    });
  }
});

// 中文：搜索展览（根据关键词搜索名称和介绍）
app.get('/api/cn/exhibitions/search', async (req, res) => {
  const { q: keyword } = req.query;

  try {
    if (!keyword || keyword.trim() === '') {
      return res.status(400).json({
        success: false,
        error: '缺少搜索关键词',
        message: '请提供搜索关键词'
      });
    }

    const fields = buildQueryFields('cn');
    const searchKeyword = `%${keyword}%`;

    const [rows] = await pool.query(
      `SELECT ${fields} FROM zhanlan WHERE name_cn LIKE ? OR introduction_cn LIKE ? ORDER BY start_time DESC`,
      [searchKeyword, searchKeyword]
    );

    console.log(`🔍 搜索"${keyword}"成功获取 ${rows.length} 条展览记录（中文）`);

    res.json({
      success: true,
      count: rows.length,
      language: 'cn',
      keyword: keyword,
      data: rows
    });
  } catch (err) {
    console.error('❌ 搜索展览失败:', err);
    res.status(500).json({
      success: false,
      error: '搜索展览失败',
      message: err.message
    });
  }
});

// 中文：按ID获取展览详情
app.get('/api/cn/exhibitions/:id', async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        error: '无效的ID',
        message: 'ID必须是正整数'
      });
    }

    const fields = buildQueryFields('cn');
    const [rows] = await pool.query(
      `SELECT ${fields} FROM zhanlan WHERE id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: '展览不存在',
        message: `未找到ID为${id}的展览`
      });
    }

    res.json({
      success: true,
      language: 'cn',
      data: rows[0]
    });
  } catch (err) {
    console.error(`❌ 查询展览ID=${id}失败:`, err);
    res.status(500).json({
      success: false,
      error: '数据库查询失败',
      message: err.message
    });
  }
});

// 中文：按省份获取展览
app.get('/api/cn/exhibitions/province/:province', async (req, res) => {
  const province = req.params.province;

  try {
    const fields = buildQueryFields('cn');
    const [rows] = await pool.query(
      `SELECT ${fields} FROM zhanlan WHERE province_cn = ? ORDER BY start_time DESC`,
      [province]
    );

    console.log(`✅ 成功获取 ${rows.length} 条${province}省的展览记录（中文）`);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: '未找到展览',
        message: `未找到${province}省的展览信息`,
        suggestion: '请确认省份中文名是否正确（如：江苏、广东、浙江）'
      });
    }

    res.json({
      success: true,
      count: rows.length,
      language: 'cn',
      province: province,
      data: rows
    });
  } catch (err) {
    console.error(`❌ 查询${province}省展览失败:`, err);
    res.status(500).json({
      success: false,
      error: '数据库查询失败',
      message: err.message
    });
  }
});

// 中文：按城市获取展览
app.get('/api/cn/exhibitions/city/:city', async (req, res) => {
  const city = req.params.city;

  try {
    const fields = buildQueryFields('cn');
    const [rows] = await pool.query(
      `SELECT ${fields} FROM zhanlan WHERE city_cn = ? ORDER BY start_time DESC`,
      [city]
    );

    console.log(`✅ 成功获取 ${rows.length} 条${city}市的展览记录（中文）`);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: '未找到展览',
        message: `未找到${city}市的展览信息`,
        suggestion: '请确认城市中文名是否正确（如：南京、广州、杭州）'
      });
    }

    res.json({
      success: true,
      count: rows.length,
      language: 'cn',
      city: city,
      data: rows
    });
  } catch (err) {
    console.error(`❌ 查询${city}市展览失败:`, err);
    res.status(500).json({
      success: false,
      error: '数据库查询失败',
      message: err.message
    });
  }
});

// 中文：按状态获取展览
app.get('/api/cn/exhibitions/status/:status', async (req, res) => {
  const status = req.params.status;

  try {
    if (!['0', '1', '2'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: '无效的状态值',
        message: '状态值必须是 0(未开始)、1(进行中) 或 2(已结束)'
      });
    }

    const fields = buildQueryFields('cn');
    const [rows] = await pool.query(
      `SELECT ${fields} FROM zhanlan WHERE status = ? ORDER BY start_time DESC`,
      [status]
    );

    const statusText = {
      '0': '未开始',
      '1': '进行中',
      '2': '已结束'
    }[status];

    console.log(`✅ 成功获取 ${rows.length} 条${statusText}的展览记录（中文）`);

    res.json({
      success: true,
      count: rows.length,
      language: 'cn',
      status: statusText,
      status_code: status,
      data: rows
    });
  } catch (err) {
    console.error(`❌ 查询状态为${status}的展览失败:`, err);
    res.status(500).json({
      success: false,
      error: '数据库查询失败',
      message: err.message
    });
  }
});

// 中文：获取筛选器选项（用于前端筛选器）
app.get('/api/cn/filters', async (req, res) => {
  try {
    // 获取所有省份
    const [provinces] = await pool.query(
      `SELECT DISTINCT province_cn as value, COUNT(*) as count FROM zhanlan GROUP BY province_cn ORDER BY province_cn`
    );

    // 获取所有城市
    const [cities] = await pool.query(
      `SELECT DISTINCT city_cn as value, COUNT(*) as count FROM zhanlan GROUP BY city_cn ORDER BY city_cn`
    );

    // 状态选项
    const statusOptions = [
      { value: '0', label: '未开始' },
      { value: '1', label: '进行中' },
      { value: '2', label: '已结束' }
    ];

    // 统计各状态数量
    const [statusCounts] = await pool.query(
      `SELECT status, COUNT(*) as count FROM zhanlan GROUP BY status`
    );

    // 将状态统计映射到选项
    statusOptions.forEach(option => {
      const count = statusCounts.find(item => item.status.toString() === option.value);
      option.count = count ? count.count : 0;
    });

    // 时间排序选项
    const sortOptions = [
      { value: 'start_time', label: '开始时间' },
      { value: 'end_time', label: '结束时间' },
      { value: 'created_at', label: '创建时间' }
    ];

    res.json({
      success: true,
      language: 'cn',
      data: {
        provinces: provinces.map(p => ({ value: p.value, count: p.count })),
        cities: cities.map(c => ({ value: c.value, count: c.count })),
        status: statusOptions,
        sort: sortOptions
      }
    });
  } catch (err) {
    console.error('❌ 获取筛选器选项失败:', err);
    res.status(500).json({
      success: false,
      error: '获取筛选器选项失败',
      message: err.message
    });
  }
});

// 中文：获取所有地理位置信息（用于地图展示）
app.get('/api/cn/locations', async (req, res) => {
  try {
    const fields = buildQueryFields('cn');
    const [rows] = await pool.query(
      `SELECT ${fields} FROM zhanlan ORDER BY province, city`
    );

    // 按省份分组
    const locationsByProvince = rows.reduce((acc, exhibition) => {
      const province = exhibition.province;
      if (!acc[province]) {
        acc[province] = {
          province: province,
          exhibitions: []
        };
      }
      acc[province].exhibitions.push({
        id: exhibition.id,
        name: exhibition.name,
        city: exhibition.city,
        location: exhibition.location,
        start_date: exhibition.start_date,
        end_date: exhibition.end_date,
        status: exhibition.status,
        status_text: exhibition.status_text,
        picture_url: exhibition.picture_url
      });
      return acc;
    }, {});

    const result = Object.values(locationsByProvince);

    res.json({
      success: true,
      count: rows.length,
      language: 'cn',
      data: result
    });
  } catch (err) {
    console.error('❌ 获取地理位置信息失败:', err);
    res.status(500).json({
      success: false,
      error: '获取地理位置信息失败',
      message: err.message
    });
  }
});

// ============ 英文API接口 ============

// 英文：获取所有展览（支持综合筛选）
app.get('/api/en/exhibitions', async (req, res) => {
  const { province, city, status, limit, page = 1, sort = 'start_time', order = 'desc' } = req.query;

  try {
    let fields = buildQueryFields('en');
    let query = `SELECT ${fields} FROM zhanlan`;
    let params = [];
    let conditions = [];

    // 动态构建查询条件
    if (province) {
      conditions.push(`province_en = ?`);
      params.push(province);
    }

    if (city) {
      conditions.push(`city_en = ?`);
      params.push(city);
    }

    if (status !== undefined && status !== '') {
      conditions.push(`status = ?`);
      params.push(status);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    // 排序
    const validSortFields = ['start_time', 'end_time', 'created_at', 'updated_at'];
    const validOrders = ['asc', 'desc'];
    const sortField = validSortFields.includes(sort) ? sort : 'start_time';
    const sortOrder = validOrders.includes(order.toLowerCase()) ? order.toUpperCase() : 'DESC';

    query += ` ORDER BY ${sortField} ${sortOrder}`;

    // 分页处理
    let limitValue = limit ? parseInt(limit) : null;
    let offsetValue = null;

    if (limitValue) {
      const pageNum = parseInt(page) || 1;
      offsetValue = (pageNum - 1) * limitValue;
      query += ` LIMIT ? OFFSET ?`;
      params.push(limitValue, offsetValue);
    }

    const [rows] = await pool.query(query, params);

    console.log(`✅ 成功获取 ${rows.length} 条展览记录（英文）`);

    // 获取总数用于分页
    let totalCount = 0;
    if (limitValue) {
      let countQuery = `SELECT COUNT(*) as total FROM zhanlan`;
      if (conditions.length > 0) {
        countQuery += ` WHERE ${conditions.join(' AND ')}`;
      }
      const [countResult] = await pool.query(countQuery, params.slice(0, -2)); // 移除LIMIT和OFFSET参数
      totalCount = countResult[0].total;
    }

    const response = {
      success: true,
      count: rows.length,
      language: 'en',
      data: rows
    };

    // 添加分页信息
    if (limitValue) {
      response.pagination = {
        page: parseInt(page),
        limit: limitValue,
        total: totalCount,
        total_pages: Math.ceil(totalCount / limitValue)
      };
    }

    res.json(response);
  } catch (err) {
    console.error('❌ 数据库查询错误:', err);
    res.status(500).json({
      success: false,
      error: 'Database query failed',
      message: err.message
    });
  }
});

// 英文：搜索展览（根据关键词搜索名称和介绍）
app.get('/api/en/exhibitions/search', async (req, res) => {
  const { q: keyword } = req.query;

  try {
    if (!keyword || keyword.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Missing search keyword',
        message: 'Please provide a search keyword'
      });
    }

    const fields = buildQueryFields('en');
    const searchKeyword = `%${keyword}%`;

    const [rows] = await pool.query(
      `SELECT ${fields} FROM zhanlan WHERE name_en LIKE ? OR introduction_en LIKE ? ORDER BY start_time DESC`,
      [searchKeyword, searchKeyword]
    );

    console.log(`🔍 搜索"${keyword}"成功获取 ${rows.length} 条展览记录（英文）`);

    res.json({
      success: true,
      count: rows.length,
      language: 'en',
      keyword: keyword,
      data: rows
    });
  } catch (err) {
    console.error('❌ 搜索展览失败:', err);
    res.status(500).json({
      success: false,
      error: 'Search failed',
      message: err.message
    });
  }
});

// 英文：按ID获取展览详情
app.get('/api/en/exhibitions/:id', async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid ID',
        message: 'ID must be a positive integer'
      });
    }

    const fields = buildQueryFields('en');
    const [rows] = await pool.query(
      `SELECT ${fields} FROM zhanlan WHERE id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Exhibition not found',
        message: `Exhibition with ID ${id} not found`
      });
    }

    res.json({
      success: true,
      language: 'en',
      data: rows[0]
    });
  } catch (err) {
    console.error(`❌ 查询展览ID=${id}失败:`, err);
    res.status(500).json({
      success: false,
      error: 'Database query failed',
      message: err.message
    });
  }
});

// 英文：按省份获取展览
app.get('/api/en/exhibitions/province/:province', async (req, res) => {
  const province = req.params.province;

  try {
    const fields = buildQueryFields('en');
    const [rows] = await pool.query(
      `SELECT ${fields} FROM zhanlan WHERE province_en = ? ORDER BY start_time DESC`,
      [province]
    );

    console.log(`✅ 成功获取 ${rows.length} 条${province}省的展览记录（英文）`);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Exhibition not found',
        message: `No exhibitions found in ${province} province`,
        suggestion: 'Please confirm the English province name is correct (e.g., Jiangsu, Guangdong, Zhejiang)'
      });
    }

    res.json({
      success: true,
      count: rows.length,
      language: 'en',
      province: province,
      data: rows
    });
  } catch (err) {
    console.error(`❌ 查询${province}省展览失败:`, err);
    res.status(500).json({
      success: false,
      error: 'Database query failed',
      message: err.message
    });
  }
});

// 英文：按城市获取展览
app.get('/api/en/exhibitions/city/:city', async (req, res) => {
  const city = req.params.city;

  try {
    const fields = buildQueryFields('en');
    const [rows] = await pool.query(
      `SELECT ${fields} FROM zhanlan WHERE city_en = ? ORDER BY start_time DESC`,
      [city]
    );

    console.log(`✅ 成功获取 ${rows.length} 条${city}市的展览记录（英文）`);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Exhibition not found',
        message: `No exhibitions found in ${city} city`,
        suggestion: 'Please confirm the English city name is correct (e.g., Nanjing, Guangzhou, Hangzhou)'
      });
    }

    res.json({
      success: true,
      count: rows.length,
      language: 'en',
      city: city,
      data: rows
    });
  } catch (err) {
    console.error(`❌ 查询${city}市展览失败:`, err);
    res.status(500).json({
      success: false,
      error: 'Database query failed',
      message: err.message
    });
  }
});

// 英文：按状态获取展览
app.get('/api/en/exhibitions/status/:status', async (req, res) => {
  const status = req.params.status;

  try {
    if (!['0', '1', '2'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status value',
        message: 'Status value must be 0(Upcoming), 1(In Progress) or 2(Ended)'
      });
    }

    const fields = buildQueryFields('en');
    const [rows] = await pool.query(
      `SELECT ${fields} FROM zhanlan WHERE status = ? ORDER BY start_time DESC`,
      [status]
    );

    const statusText = {
      '0': 'Upcoming',
      '1': 'In Progress',
      '2': 'Ended'
    }[status];

    console.log(`✅ 成功获取 ${rows.length} 条${statusText}的展览记录（英文）`);

    res.json({
      success: true,
      count: rows.length,
      language: 'en',
      status: statusText,
      status_code: status,
      data: rows
    });
  } catch (err) {
    console.error(`❌ 查询状态为${status}的展览失败:`, err);
    res.status(500).json({
      success: false,
      error: 'Database query failed',
      message: err.message
    });
  }
});

// 英文：获取筛选器选项（用于前端筛选器）
app.get('/api/en/filters', async (req, res) => {
  try {
    // 获取所有省份
    const [provinces] = await pool.query(
      `SELECT DISTINCT province_en as value, COUNT(*) as count FROM zhanlan GROUP BY province_en ORDER BY province_en`
    );

    // 获取所有城市
    const [cities] = await pool.query(
      `SELECT DISTINCT city_en as value, COUNT(*) as count FROM zhanlan GROUP BY city_en ORDER BY city_en`
    );

    // 状态选项
    const statusOptions = [
      { value: '0', label: 'Upcoming' },
      { value: '1', label: 'In Progress' },
      { value: '2', label: 'Ended' }
    ];

    // 统计各状态数量
    const [statusCounts] = await pool.query(
      `SELECT status, COUNT(*) as count FROM zhanlan GROUP BY status`
    );

    // 将状态统计映射到选项
    statusOptions.forEach(option => {
      const count = statusCounts.find(item => item.status.toString() === option.value);
      option.count = count ? count.count : 0;
    });

    // 时间排序选项
    const sortOptions = [
      { value: 'start_time', label: 'Start Time' },
      { value: 'end_time', label: 'End Time' },
      { value: 'created_at', label: 'Created Date' }
    ];

    res.json({
      success: true,
      language: 'en',
      data: {
        provinces: provinces.map(p => ({ value: p.value, count: p.count })),
        cities: cities.map(c => ({ value: c.value, count: c.count })),
        status: statusOptions,
        sort: sortOptions
      }
    });
  } catch (err) {
    console.error('❌ 获取筛选器选项失败:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to get filter options',
      message: err.message
    });
  }
});

// 英文：获取所有地理位置信息（用于地图展示）
app.get('/api/en/locations', async (req, res) => {
  try {
    const fields = buildQueryFields('en');
    const [rows] = await pool.query(
      `SELECT ${fields} FROM zhanlan ORDER BY province, city`
    );

    // 按省份分组
    const locationsByProvince = rows.reduce((acc, exhibition) => {
      const province = exhibition.province;
      if (!acc[province]) {
        acc[province] = {
          province: province,
          exhibitions: []
        };
      }
      acc[province].exhibitions.push({
        id: exhibition.id,
        name: exhibition.name,
        city: exhibition.city,
        location: exhibition.location,
        start_date: exhibition.start_date,
        end_date: exhibition.end_date,
        status: exhibition.status,
        status_text: exhibition.status_text,
        picture_url: exhibition.picture_url
      });
      return acc;
    }, {});

    const result = Object.values(locationsByProvince);

    res.json({
      success: true,
      count: rows.length,
      language: 'en',
      data: result
    });
  } catch (err) {
    console.error('❌ 获取地理位置信息失败:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to get location information',
      message: err.message
    });
  }
});

// 启动服务器
async function startServer() {
  const dbConnected = await testDatabaseConnection();

  if (dbConnected) {
    app.listen(port, () => {
      console.log(`🚀 后端服务已启动，监听端口: ${port}`);
      console.log('\n📊 数据库信息:');
      console.log(`   数据库: exhibition_db`);
      console.log(`   表: zhanlan (中英双语)`);
      console.log(`   当前展览数量: 5`);

      console.log('\n🌐 中文API接口:');
      console.log(`   GET  /api/cn/exhibitions             # 获取所有展览`);
      console.log(`   GET  /api/cn/exhibitions/search     # 搜索展览`);
      console.log(`   GET  /api/cn/exhibitions/:id        # 按ID获取展览详情`);
      console.log(`   GET  /api/cn/exhibitions/province/:province  # 按省份查询`);
      console.log(`   GET  /api/cn/exhibitions/city/:city          # 按城市查询`);
      console.log(`   GET  /api/cn/exhibitions/status/:status      # 按状态查询`);
      console.log(`   GET  /api/cn/filters                # 获取筛选器选项`);
      console.log(`   GET  /api/cn/locations              # 获取地理位置信息`);

      console.log('\n🌐 英文API接口:');
      console.log(`   GET  /api/en/exhibitions             # 获取所有展览`);
      console.log(`   GET  /api/en/exhibitions/search     # 搜索展览`);
      console.log(`   GET  /api/en/exhibitions/:id        # 按ID获取展览详情`);
      console.log(`   GET  /api/en/exhibitions/province/:province  # 按省份查询`);
      console.log(`   GET  /api/en/exhibitions/city/:city          # 按城市查询`);
      console.log(`   GET  /api/en/exhibitions/status/:status      # 按状态查询`);
      console.log(`   GET  /api/en/filters                # 获取筛选器选项`);
      console.log(`   GET  /api/en/locations              # 获取地理位置信息`);

      console.log('\n📋 前端使用示例:');
      console.log(`   1. 用户选择中文 → 所有API调用 /api/cn/ 前缀`);
      console.log(`   2. 用户选择英文 → 所有API调用 /api/en/ 前缀`);
      console.log(`   3. 首页展示: /api/cn/exhibitions?limit=8 (限制数量)或前端随机选择`);
      console.log(`   4. 筛选展览: /api/cn/exhibitions?province=江苏&status=1`);
      console.log(`   5. 搜索展览: /api/cn/exhibitions/search?q=水墨`);
      console.log(`   6. 获取筛选器: /api/cn/filters`);

      console.log('\n📍 省份城市对照表:');
      console.log(`   中文 | 英文`);
      console.log(`   ---------------`);
      console.log(`   江苏 | Jiangsu`);
      console.log(`   广东 | Guangdong`);
      console.log(`   浙江 | Zhejiang`);
      console.log(`   南京 | Nanjing`);
      console.log(`   广州 | Guangzhou`);
      console.log(`   杭州 | Hangzhou`);

      console.log('\n🎯 前端实现建议:');
      console.log(`   1. 在应用初始化时获取用户语言偏好（从localStorage或默认中文）`);
      console.log(`   2. 设置全局变量或Context存储当前语言`);
      console.log(`   3. 所有API请求根据当前语言使用对应前缀`);
      console.log(`   4. 首页可以获取所有展览（可限制数量）然后前端随机展示部分`);
      console.log(`   5. 筛选器获取省份、城市、状态列表`);
      console.log(`   6. 搜索结果页面使用搜索API`);

      console.log(`\n✅ 服务器已就绪，可以开始前后端联调！`);
    });
  } else {
    console.error('❌ 无法启动服务器，数据库连接失败');
    process.exit(1);
  }
}

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('❌ 服务器错误:', err.stack);
  res.status(500).json({
    success: false,
    error: '服务器内部错误',
    message: err.message
  });
});

// 404 处理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'API端点不存在',
    message: `找不到 ${req.method} ${req.url}`,
    suggestion: '请检查API端点是否正确'
  });
});

// 启动服务器
startServer();