USE exhibition_db;

-- 创建展览表
CREATE TABLE zhanlan (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL COMMENT '展览名称',
    start_time DATE NOT NULL COMMENT '开始时间',
    end_time DATE NOT NULL COMMENT '结束时间',
    province VARCHAR(50) NOT NULL COMMENT '省份',
    city VARCHAR(50) NOT NULL COMMENT '城市',
    location VARCHAR(200) NOT NULL COMMENT '具体地点',
    introduction TEXT COMMENT '展览介绍',
    picture_url VARCHAR(500) COMMENT '图片URL',
    status TINYINT DEFAULT 0 COMMENT '状态：0-未开始，1-进行中，2-已结束',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_end_time (end_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='展览信息表';

-- 插入数据
INSERT INTO zhanlan (name, start_time, end_time, province, city, location, introduction, picture_url) VALUES
(
    '面容与印迹：维姆·文德斯 × 罗伯特·博西西奥影像绘画双人展',
    '2025-12-11',
    '2026-03-15',
    '浙江',
    '杭州',
    '浙江美术馆',
    '一场关于影像与绘画的静谧对话，即将在杭州展开。两位来自德国与意大利的艺术家，用镜头与画笔，捕捉时间中那些细微而永恒的时刻。',
    'https://www.zjam.org.cn/SiteAdmin/Holding/Logo/20251125163410.jpg'
),
(
    '山花迷人眼------彭康隆水墨画展',
    '2025-11-14',
    '2026-03-08',
    '广东',
    '广州',
    '广东美术馆新馆（白鹅潭）',
    '当代重要的水墨艺术家彭康隆（1962年生于中国台湾），将在广东美术馆白鹅潭馆区，呈现其迄今为止最大规模的机构个展"山花迷人眼"，全面梳理其独创融合山水与花卉两种题材的当代演绎。展览由广东美术馆主办，墨斋协办，广东美术馆馆长王绍强任总策划，中国美术馆研究员邓锋担纲策展。展出近90幅珍品，时代跨度25年，其中多件超长手卷、巨幅画作与特制屏风等精彩亮相！"迷"是此次展览的题眼。彭康隆以缠绕、积叠、漂浮、满密的笔墨线质，别具一格地将山水与花卉交织构成，逼人眼目，撩人情绪。山水与花卉的空间节奏起伏，引人入胜。其笔墨呼应其个性，率性直接，充满动势，随机生发。其设色、墨韵与粗麻纸质的相互碰撞，营造出超载的逼人感与吸入感。学者赖毓芝对彭康隆的创作给予高度评价："此种具有矛盾、转换、变形的空间与造型，以及与极具表现主义特质的线条并置，使得彭康隆早先已发展出的风格与母题，进一步转化为一种能够随时有机变形的存在形式。而这种自由的向度，也许正是彭康隆历经20年、透过对惯习的持续解构与内化后所达成的一种松动与解放。"',
    'https://www.gdmoa.org/Exhibition/Current/202511/W020251114530794955307.jpg'
),
(
    '单凡艺术四十年',
    '2025-11-21',
    '2026-03-01',
    '广东',
    '广州',
    '广东美术馆新馆（白鹅潭）',
    '以1985年为起点，本次展览呈现单凡跨越四十年的艺术历程。彼年创作的《金与灰》标志着他进入资本主义世界后试图穿透历史的起点，也与他近年来愈加"向窄"、趋于内省的创作路径形成呼应。作为海外华人艺术家的代表，单凡的生命与创作始终在多重文化的"缝隙"中展开，其经验折射出当代全球移民群体在多重时空中协商、生成"第三空间"的现实与精神状态。本次展览由文献与作品两部分构成，彼此形成互文：文献部分揭示艺术家从"内"出走、再回望"内"的精神历程；作品部分则展示他如何将混杂的文化经验与现实感知转化为视觉语言。作品部分分为三个主题单元------抽象表现主义、工业风景与竹子母题系列------并以《墨水人生漂不白》《金与灰》《塔皮亚斯的大线条》三件作品为精神坐标，构建出单凡以世界观、方法论与问题意识为核心的三位一体结构。由广东美术馆主办的此次展览，遴选艺术家七十余件重要作品，系统呈现他对中国传统艺术中"境界"美学观念的吸收、转化与重释。这不仅是一场回顾性的总结，更是一场关于跨文化身份、艺术语言演变与精神维度延展的深层对话。',
    'https://www.gdmoa.org/Exhibition/Current/202511/W020251114566863034249.jpg'
),
(
    '东方光影志------美术片《大闹天宫》跨媒介艺术展',
    '2025-09-23',
    '2026-01-06',
    '江苏',
    '南京',
    '江苏省美术馆陈列馆',
    '本次展览是美术片《大闹天宫》及其延展路径的集中呈现，也是首次以"跨媒介"阐述维度，在美术馆语境中的呈现。在国立美术陈列馆旧址的空间中，我们试图搭建多重对话：影像与实物的对话，呈现分镜手稿、美术设定、台本等珍贵文献，还原动画生产的本体脉络；传统与数字的对话，通过线稿原件与数字技术的碰撞，探索经典的当代转译；记忆与再造的对话，追溯从江南文脉孕育的创作基因，到20世纪60年代的国际传播轨迹，再到后世文化IP的迭代演化，完整呈现一个文化符号穿越媒介边界的生命历程。',
    'https://mmbiz.qpic.cn/sz_mmbiz_jpg/tBRJY1YqQuy06fK9jIUfxWyibbMIETFoVJcuZL8KQuNBfwGe0basNNTibpsiaiaqnxno5yHhVNptYe0wDU5BJwIPZw/640?wx_fmt=jpeg&tp=webp&wxfrom=5&wx_lazy=1#imgIndex=1'
),
(
    '周京新：有鱼',
    '2025-11-27',
    '2025-12-21',
    '江苏',
    '南京',
    '江苏省美术馆陈列馆',
    '"周京新：有鱼"特展集中呈现画家近期全新创作的一系列以大鱼为主题的作品，旨在将寻常视角中的游鱼，以宏阔的视觉尺度进行表现。这不仅是物理形态的放大，更是画家长久以来对笔墨意趣研究的自觉践行与集中呈现。',
    'https://mmbiz.qpic.cn/sz_mmbiz_jpg/tBRJY1YqQuxFGQG5fBCn3Ih4W04Hj68ibIPvLJIlkLB7X7s7eXoCCMKkhbv9wTiaBsr2HCN1JCm9FWuEQDZSZjkg/640?wx_fmt=jpeg&tp=webp&wxfrom=5&wx_lazy=1#imgIndex=1'
),
(
    '与物为春------刘万鸣艺术展',
    '2025-11-07',
    '2025-12-07',
    '山东',
    '济南',
    '山东美术馆',
    '刘万鸣艺术作品500余件。分为搜妙、觅趣、尚朴、创真、求意五个单元',
    'http://www.sdam.org.cn/picture/-1/0e3076bd8c0e4f18a42867fea1a4c776.jpg'
),
(
    '巍巍者华------中国油画学会三十年艺术展',
    '2025-09-19',
    '2026-01-04',
    '上海',
    '上海',
    '上海美术馆',
    '值此中国油画学会成立三十周年之际，"巍巍者华------中国油画学会三十年艺术展"于上海美术馆隆重启幕。展览以"史诗高华""人民纪神""山河揽胜""草木寄心"四大板块，系统呈现八百余件作品，蔚为大观。展览荟萃詹建俊、靳尚谊、全山石、罗中立、刘小东、王沂东、忻东旺等几代油画名家的经典力作，清晰勾勒三十年来中国油画承前启后的创作脉络。作为国内近年规模最大的油画专题展，展览聚焦油画语言的本体探索，集中展现文化自信背景下中国油画自觉、自立与创新的发展道路，为观众带来一场厚重的视觉与思想盛宴。',
    'https://artmuseumonline.org/art/upload/image/2025/09/18/2a96d6472f3446fb957b72cb51bcdc4a.png'
),
(
    '其命惟新------广东美术百年大展',
    '2025-10-18',
    '2026-01-18',
    '上海',
    '上海',
    '上海美术馆',
    '其命惟新------广东美术百年大展"汇聚约800件/套广东美术精品力作，展陈面积近2万平方米，设置有七大主题板块与三个特别项目交织叙事，并辅以丰富详实的历史文献与影像资料，构建起多维观展体验。',
    'https://artmuseumonline.org/art/upload/image/2025/10/17/1b83dac5b6aa424bb8409e3a3d2b043f.jpg'
),
(
    '第十三届上海美术大展',
    '2025-11-29',
    '2026-01-04',
    '上海',
    '上海',
    '上海美术馆',
    '十三届上海美术大展是由上海市文学艺术界联合会、上海市美术家协会、上海美术馆共同主办，旨在深入学习贯彻党的二十届三中、四中全会精神和习近平文化思想，全面展示近两年来上海美术创作的最新成果，集中推出一批思想精深、艺术精湛、制作精良的优秀佳作。',
    'https://artmuseumonline.org/art/upload/image/2025/11/29/cc2fa284bd0c4eccb649e7ca34770147.jpg'
),
(
    '以神取形------吴宪生作品展',
    '2025-11-15',
    '2026-01-04',
    '安徽',
    '合肥',
    '安徽省美术馆',
    '年近七旬的人物画家吴宪生，回应时代之问，深契时代之需，走出了自己的艺术之路。我认为，吴宪生的艺术起步深受两方面影响，即：浙派人物画的深厚传统滋养与西方古典艺术造型意识的根植。他持守着"不论中西、融通古今"的理念，一路探索前行。',
    'https://www.ahsmsg.com/wxapi/upload/5f4a36ec-3bff-4fd9-8bf5-c567c25acdd3.jpg'
);

-- 检查事件调度器是否已启用
SHOW VARIABLES LIKE 'event_scheduler';

-- 如果未启用，启用事件调度器（需要管理员权限）
SET GLOBAL event_scheduler = ON;

USE exhibition_db;

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

-- 查看更新后的状态
SELECT 
    id, 
    name, 
    start_time, 
    end_time,
    CASE status
        WHEN 0 THEN '未开始'
        WHEN 1 THEN '进行中'
        WHEN 2 THEN '已结束'
        ELSE '未知'
    END AS 状态,
    CURDATE() AS 当前日期
FROM zhanlan 
ORDER BY status, start_time;
