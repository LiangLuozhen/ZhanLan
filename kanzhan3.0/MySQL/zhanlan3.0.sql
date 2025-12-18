USE exhibition_db;

-- 删除现有的zhanlan表（如果存在）
DROP TABLE IF EXISTS zhanlan;

-- 创建新的zhanlan表，包含中英文字段
CREATE TABLE zhanlan (
    id INT PRIMARY KEY AUTO_INCREMENT,
    -- 中文字段
    name_cn VARCHAR(255) NOT NULL COMMENT '展览中文名称',
    province_cn VARCHAR(50) NOT NULL COMMENT '省份中文',
    city_cn VARCHAR(50) NOT NULL COMMENT '城市中文',
    location_cn VARCHAR(200) NOT NULL COMMENT '具体地点中文',
    introduction_cn TEXT COMMENT '展览介绍中文',
    
    -- 英文字段
    name_en VARCHAR(255) COMMENT '展览英文名称',
    province_en VARCHAR(50) COMMENT '省份英文',
    city_en VARCHAR(50) COMMENT '城市英文',
    location_en VARCHAR(200) COMMENT '具体地点英文',
    introduction_en TEXT COMMENT '展览介绍英文',
    
    -- 其他字段
    picture_url VARCHAR(500) COMMENT '图片URL',
    start_time DATE NOT NULL COMMENT '开始时间',
    end_time DATE NOT NULL COMMENT '结束时间',
    status TINYINT DEFAULT 0 COMMENT '状态：0-未开始，1-进行中，2-已结束',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- 索引
    INDEX idx_status (status),
    INDEX idx_end_time (end_time),
    INDEX idx_start_time (start_time),
    INDEX idx_province_city (province_cn, city_cn)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='展览信息表（中英双语）';

-- 插入第一条展览数据（面容与印迹）
INSERT INTO zhanlan (
    name_cn, name_en, 
    start_time, end_time,
    province_cn, province_en, 
    city_cn, city_en, 
    location_cn, location_en,
    introduction_cn, introduction_en,
    picture_url
) VALUES (
    '面容与印迹：维姆·文德斯 × 罗伯特·博西西奥影像绘画双人展',
    'Faces and Marks: A Duo Exhibition of Film and Painting by Wim Wenders and Robert Borsig',
    '2025-12-11',
    '2026-03-15',
    '浙江',
    'Zhejiang',
    '杭州',
    'Hangzhou',
    '浙江美术馆',
    'Zhejiang Art Museum',
    '一场关于影像与绘画的静谧对话，即将在杭州展开。两位来自德国与意大利的艺术家，用镜头与画笔，捕捉时间中那些细微而永恒的时刻。',
    'A quiet dialogue about images and painting is about to unfold in Hangzhou. Two artists from Germany and Italy use their lenses and brushes to capture the subtle yet eternal moments in time.',
    'https://www.zjam.org.cn/SiteAdmin/Holding/Logo/20251125163410.jpg'
);

-- 插入第二条展览数据（山花迷人眼）
INSERT INTO zhanlan (
    name_cn, name_en, 
    start_time, end_time,
    province_cn, province_en, 
    city_cn, city_en, 
    location_cn, location_en,
    introduction_cn, introduction_en,
    picture_url
) VALUES (
    '山花迷人眼——彭康隆水墨画展',
    'Enchanting Eyes of Mountain Flowers - Peng Kanglong Ink Painting Exhibition',
    '2025-11-14',
    '2026-03-08',
    '广东',
    'Guangdong',
    '广州',
    'Guangzhou',
    '广东美术馆新馆（白鹅潭）',
    'New Guangdong Museum of Art (White Goose Pond)',
    '当代重要的水墨艺术家彭康隆，将在广东美术馆白鹅潭馆区，呈现其迄今为止最大规模的机构个展"山花迷人眼"，全面梳理其独创融合山水与花卉两种题材的当代演绎。展览由广东美术馆主办，墨斋协办，广东美术馆馆长王绍强任总策划，中国美术馆研究员邓锋担纲策展。展出近90幅珍品，时代跨度25年，其中多件超长手卷、巨幅画作与特制屏风等精彩亮相！"迷"是此次展览的题眼。彭康隆以缠绕、积叠、漂浮、满密的笔墨线质，别具一格地将山水与花卉交织构成，逼人眼目，撩人情绪。山水与花卉的空间节奏起伏，引人入胜。其笔墨呼应其个性，率性直接，充满动势，随机生发。其设色、墨韵与粗麻纸质的相互碰撞，营造出超载的逼人感与吸入感。',
    'Peng Kanglong, an important contemporary ink artist, will present his largest institutional solo exhibition "Charming Eyes of Mountain Flowers" in the White Goose Pond area of Guangdong Museum of Art, comprehensively sorting out his original contemporary interpretation that combines the themes of landscape and flowers. The exhibition is hosted by Guangdong Museum of Art, co organized by Ink Studio, with Wang Shaoqiang, the director of Guangdong Museum of Art, as the overall planner, and Deng Feng, a researcher at the National Art Museum of China, as the curator. Exhibiting nearly 90 treasures spanning 25 years, including several super long hand scrolls, giant paintings, and specially made screens, among others! "Maze" is the theme of this exhibition. Peng Kanglong interweaves mountains, waters, and flowers in a unique way with intertwined, stacked, floating, and dense brush and ink lines, which is eye-catching and emotional. The spatial rhythm of mountains, waters, and flowers is undulating and captivating. Its brushwork echoes its personality, with a direct and spontaneous style, full of momentum, and randomly generated hair. The collision of colors, ink tones, and coarse linen paper creates a sense of overwhelming pressure and inhalation.',
    'https://www.gdmoa.org/Exhibition/Current/202511/W020251114530794955307.jpg'
);

-- 检查事件调度器是否已启用
SHOW VARIABLES LIKE 'event_scheduler';

-- 如果未启用，启用事件调度器（需要管理员权限）
SET GLOBAL event_scheduler = ON;

-- 创建存储过程：更新展览状态
DELIMITER //
CREATE PROCEDURE update_exhibition_status()
BEGIN
    -- 更新状态逻辑：
    -- 0-未开始（当前时间 < 开始时间）
    -- 1-进行中（当前时间在开始时间和结束时间之间）
    -- 2-已结束（当前时间 > 结束时间）
    UPDATE zhanlan 
    SET status = CASE 
        WHEN CURDATE() < start_time THEN 0  -- 未开始
        WHEN CURDATE() BETWEEN start_time AND end_time THEN 1  -- 进行中
        WHEN CURDATE() > end_time THEN 2  -- 已结束
        ELSE status
    END
    WHERE status != CASE 
        WHEN CURDATE() < start_time THEN 0
        WHEN CURDATE() BETWEEN start_time AND end_time THEN 1
        WHEN CURDATE() > end_time THEN 2
        ELSE status
    END;  -- 只更新状态发生变化的记录
END //
DELIMITER ;

-- 创建事件：每天凌晨1点自动更新状态
CREATE EVENT IF NOT EXISTS auto_update_exhibition_status
ON SCHEDULE EVERY 1 DAY
STARTS TIMESTAMP(CURRENT_DATE, '01:00:00')
DO
    CALL update_exhibition_status();

-- 手动执行存储过程更新状态
SET SQL_SAFE_UPDATES = 0;
CALL update_exhibition_status();

-- 查看表结构
DESCRIBE zhanlan;

-- 查看插入的数据
SELECT 
    id,
    name_cn AS '中文名称',
    name_en AS '英文名称',
    start_time AS '开始时间',
    end_time AS '结束时间',
    province_cn AS '省份(中)',
    province_en AS '省份(英)',
    city_cn AS '城市(中)',
    city_en AS '城市(英)',
    CASE status
        WHEN 0 THEN '未开始'
        WHEN 1 THEN '进行中'
        WHEN 2 THEN '已结束'
        ELSE '未知'
    END AS 状态,
    created_at AS '创建时间'
FROM zhanlan 
ORDER BY start_time DESC;

-- 查看当前时间和状态
SELECT 
    CURDATE() AS '当前日期',
    COUNT(*) AS '总展览数',
    SUM(CASE WHEN status = 0 THEN 1 ELSE 0 END) AS '未开始',
    SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) AS '进行中',
    SUM(CASE WHEN status = 2 THEN 1 ELSE 0 END) AS '已结束'
FROM zhanlan;