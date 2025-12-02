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
  password: '123456', // 密码
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
    console.log('成功连接到数据库');

    // 测试简单查询
    const [result] = await connection.query('SELECT 1 + 1 AS solution');
    console.log(`数据库测试查询结果: ${result[0].solution}`);

    connection.release();
    return true;
  } catch (err) {
    console.error('数据库连接失败:', err.message);
    return false;
  }
}

// API端点

// 健康检查端点
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: '后端服务运行正常',
    timestamp: new Date().toISOString()
  });
});

// 获取所有展览（使用新的表名和字段名）
app.get('/api/exhibitions', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        id, 
        name, 
        start_time AS start_date, 
        end_time AS end_date, 
        province, 
        city, 
        location, 
        introduction, 
        picture_url,
        status,
        CASE status
          WHEN 0 THEN '未开始'
          WHEN 1 THEN '进行中'
          WHEN 2 THEN '已结束'
          ELSE '未知'
        END AS status_text,
        created_at,
        updated_at
      FROM zhanlan
    `);

    console.log(`成功获取 ${rows.length} 条展览记录`);
    res.json(rows);
  } catch (err) {
    console.error('数据库查询错误详情:', {
      message: err.message,
      code: err.code,
      sql: err.sql,
      stack: err.stack
    });

    res.status(500).json({
      error: '数据库查询失败',
      details: {
        message: err.message,
        code: err.code,
        suggestion: '请检查数据库连接和查询语句'
      }
    });
  }
});

// 按城市获取展览
app.get('/api/exhibitions/city/:city', async (req, res) => {
  const city = req.params.city;
  try {
    const [rows] = await pool.query(
      `SELECT 
        id, 
        name, 
        start_time AS start_date, 
        end_time AS end_date, 
        province, 
        city, 
        location, 
        introduction, 
        picture_url,
        status,
        CASE status
          WHEN 0 THEN '未开始'
          WHEN 1 THEN '进行中'
          WHEN 2 THEN '已结束'
          ELSE '未知'
        END AS status_text,
        created_at,
        updated_at
      FROM zhanlan WHERE city = ?`,
      [city]
    );

    console.log(`成功获取 ${rows.length} 条${city}的展览记录`);

    if (rows.length === 0) {
      return res.status(404).json({
        error: `未找到${city}的展览信息`
      });
    }

    res.json(rows);
  } catch (err) {
    console.error(`查询${city}展览失败:`, err);
    res.status(500).json({
      error: '数据库查询失败',
      details: err.message
    });
  }
});

// 获取当前进行中的展览（状态为1）
app.get('/api/exhibitions/current', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
        id, 
        name, 
        start_time AS start_date, 
        end_time AS end_date, 
        province, 
        city, 
        location, 
        introduction, 
        picture_url,
        status,
        CASE status
          WHEN 0 THEN '未开始'
          WHEN 1 THEN '进行中'
          WHEN 2 THEN '已结束'
          ELSE '未知'
        END AS status_text,
        created_at,
        updated_at
      FROM zhanlan 
      WHERE status = 1`,
    );

    console.log(`成功获取 ${rows.length} 条进行中的展览记录`);
    res.json(rows);
  } catch (err) {
    console.error('查询当前展览失败:', err);
    res.status(500).json({
      error: '数据库查询失败',
      details: err.message
    });
  }
});

// 按ID获取展览详情
app.get('/api/exhibitions/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const [rows] = await pool.query(
      `SELECT 
        id, 
        name, 
        start_time AS start_date, 
        end_time AS end_date, 
        province, 
        city, 
        location, 
        introduction, 
        picture_url,
        status,
        CASE status
          WHEN 0 THEN '未开始'
          WHEN 1 THEN '进行中'
          WHEN 2 THEN '已结束'
          ELSE '未知'
        END AS status_text,
        created_at,
        updated_at
      FROM zhanlan WHERE id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        error: `未找到ID为${id}的展览`
      });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(`查询展览ID=${id}失败:`, err);
    res.status(500).json({
      error: '数据库查询失败',
      details: err.message
    });
  }
});

// 按省份获取展览
app.get('/api/exhibitions/province/:province', async (req, res) => {
  const province = req.params.province;
  try {
    const [rows] = await pool.query(
      `SELECT 
        id, 
        name, 
        start_time AS start_date, 
        end_time AS end_date, 
        province, 
        city, 
        location, 
        introduction, 
        picture_url,
        status,
        CASE status
          WHEN 0 THEN '未开始'
          WHEN 1 THEN '进行中'
          WHEN 2 THEN '已结束'
          ELSE '未知'
        END AS status_text,
        created_at,
        updated_at
      FROM zhanlan WHERE province = ?`,
      [province]
    );

    console.log(`成功获取 ${rows.length} 条${province}省的展览记录`);

    if (rows.length === 0) {
      return res.status(404).json({
        error: `未找到${province}省的展览信息`
      });
    }

    res.json(rows);
  } catch (err) {
    console.error(`查询${province}省展览失败:`, err);
    res.status(500).json({
      error: '数据库查询失败',
      details: err.message
    });
  }
});

// 按状态获取展览（0-未开始，1-进行中，2-已结束）
app.get('/api/exhibitions/status/:status', async (req, res) => {
  const status = req.params.status;
  try {
    // 验证状态值是否有效
    if (!['0', '1', '2'].includes(status)) {
      return res.status(400).json({
        error: '无效的状态值，必须是 0(未开始)、1(进行中) 或 2(已结束)'
      });
    }

    const [rows] = await pool.query(
      `SELECT 
        id, 
        name, 
        start_time AS start_date, 
        end_time AS end_date, 
        province, 
        city, 
        location, 
        introduction, 
        picture_url,
        status,
        CASE status
          WHEN 0 THEN '未开始'
          WHEN 1 THEN '进行中'
          WHEN 2 THEN '已结束'
          ELSE '未知'
        END AS status_text,
        created_at,
        updated_at
      FROM zhanlan WHERE status = ?`,
      [status]
    );

    const statusText = { '0': '未开始', '1': '进行中', '2': '已结束' }[status];
    console.log(`成功获取 ${rows.length} 条${statusText}的展览记录`);
    res.json(rows);
  } catch (err) {
    console.error(`查询状态为${status}的展览失败:`, err);
    res.status(500).json({
      error: '数据库查询失败',
      details: err.message
    });
  }
});

// 启动服务器
async function startServer() {
  const dbConnected = await testDatabaseConnection();

  if (dbConnected) {
    app.listen(port, () => {
      console.log(`后端服务已启动，监听端口: ${port}`);
      console.log('可用API端点:');
      console.log(`- GET /api/exhibitions     # 获取所有展览`);
      console.log(`- GET /api/exhibitions/city/:city # 按城市查询（例：/api/exhibitions/city/广州）`);
      console.log(`- GET /api/exhibitions/province/:province # 按省份查询（例：/api/exhibitions/province/广东）`);
      console.log(`- GET /api/exhibitions/status/:status # 按状态查询（0-未开始，1-进行中，2-已结束）`);
      console.log(`- GET /api/exhibitions/:id # 按ID查询（例：/api/exhibitions/1）`);
      console.log(`- GET /api/exhibitions/current # 获取当前进行中的展览`);
      console.log(`- GET /api/health # 健康检查`);
      console.log(`\n测试建议: 使用浏览器或Postman访问 http://127.0.0.1:${port}/api/exhibitions`);
    });
  } else {
    console.error('无法启动服务器，数据库连接失败');
    process.exit(1);
  }
}

// 启动服务器
startServer();