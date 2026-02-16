class JRADatabase {
    constructor() {
        this.horses = [];
        this.jockeys = [];
        this.races = [];
        this.dataLoaded = false;
        this.loadStartTime = Date.now();
        this.initializeData();
    }

    async initializeData() {
        try {
            console.log('开始加载数据...');
            const startTime = Date.now();
            
            // 检查页面中是否已经定义了horseData
            if (typeof window !== 'undefined' && window.horseData && window.horseData.length > 0) {
                console.log('使用页面中嵌入的数据');
                const realData = window.horseData;
                console.log('数据加载成功，原始数据条数:', realData.length);
                
                // 检查前几个数据项的结构
                if (realData.length > 0) {
                    console.log('第一个数据项结构:', JSON.stringify(realData[0], null, 2));
                    console.log('第一个数据项的奖金字段:', realData[0]["奖金"], '总奖金字段:', realData[0]["总奖金"]);
                    console.log('第一个数据项的所有字段:', Object.keys(realData[0]));
                }
                
                // 检查数据格式，处理新旧数据格式差异
                this.horses = realData.map((horse, index) => {
                    // 检查数据格式，处理奖金字段的差异
                    let earningsValue = 0;
                    if (typeof horse["奖金"] !== "undefined") {
                        // 旧格式，奖金字段
                        earningsValue = horse["奖金"];
                        console.log(`第${index}匹马的奖金（旧格式）:`, earningsValue);
                    } else if (typeof horse["总奖金"] !== "undefined") {
                        // 新格式，总奖金字段
                        earningsValue = horse["总奖金"];
                        console.log(`第${index}匹马的奖金（新格式）:`, earningsValue);
                    } else if (typeof horse["奖金(円)"] !== "undefined") {
                        // 其他可能格式
                        earningsValue = horse["奖金(円)"];
                        console.log(`第${index}匹马的奖金（其他格式）:`, earningsValue);
                    } else {
                        // 如果都没有，使用默认值
                        earningsValue = 0;
                        console.log(`第${index}匹马没有奖金字段`);
                    }
                    
                    // 检查必要的字段是否存在
                    const horseData = {
                        id: `H${String(index).padStart(4, '0')}`,
                        name: horse["马匹名称（日文名）"] || horse["name"] || "未知",
                        jockey: horse["骑师姓名"] || horse["jockey"] || "未知",
                        year: horse["出生年份"] || horse["year"] || 0,
                        wins: horse["胜场数"] || horse["wins"] || 0,
                        races: horse["参赛数"] || horse["races"] || 0,
                        winRate: horse["胜率"] || horse["winRate"] || 0,
                        birthYear: horse["出生年份"] || horse["birthYear"] || 0,
                        breed: horse["品种"] || horse["breed"] || "未知",
                        color: horse["毛色"] || horse["color"] || "未知",
                        height: horse["身高"] ? `${horse["身高"]}cm` : horse["height"] || "未知",
                        weight: horse["体重"] ? `${horse["体重"]}kg` : horse["weight"] || "未知",
                        trainer: horse["训练师"] || horse["trainer"] || "未知",
                        earnings: earningsValue, // 保存原始数值而不是格式化字符串
                        rank: index + 1,
                        careerLength: horse["生涯年数"] || horse["careerLength"] || 0
                    };
                    
                    console.log(`第${index}匹马转换后:`, horseData.name, '奖金:', earningsValue, '字段:', Object.keys(horseData));
                    return horseData;
                });
                
                this.jockeys = this.extractJockeys(this.horses);
                console.log('成功加载马匹数据:', this.horses.length, '匹');
                
                // 确保数据完全加载后再触发更新
                this.dataLoaded = true;
                console.log('数据加载完成，耗时:', (Date.now() - startTime) + 'ms');
                return;
            }
            
            // 如果页面中没有数据，尝试加载real_horse_data.json文件
            console.log('页面中没有horseData，尝试加载real_horse_data.json文件');
            
            // 如果页面中没有数据，尝试使用相对路径加载
            let response;
            try {
                console.log('尝试加载 real_horse_data.json');
                response = await fetch('real_horse_data.json');
                console.log('使用相对路径加载');
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
            } catch (e) {
                console.log('相对路径加载失败:', e.message);
                // 如果相对路径失败，尝试绝对路径
                try {
                    console.log('尝试加载 /d:/腾讯AI/TEST/real_horse_data.json');
                    response = await fetch('/d:/腾讯AI/TEST/real_horse_data.json');
                    console.log('使用绝对路径加载');
                    
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                } catch (e2) {
                    console.log('绝对路径加载也失败，使用模拟数据');
                    // 如果所有加载方法都失败，使用模拟数据
                    this.horses = this.generateMockData();
                    this.jockeys = this.extractJockeys(this.horses);
                    console.log('使用后备数据，马匹数量:', this.horses.length);
                    this.dataLoaded = true;
                    console.log('数据加载完成，耗时:', (Date.now() - startTime) + 'ms');
                    return;
                }
            }
            
            const realData = await response.json();
            console.log('数据加载成功，原始数据条数:', realData.length);
            
            // 检查前几个数据项的结构
            if (realData.length > 0) {
                console.log('第一个数据项结构:', JSON.stringify(realData[0], null, 2));
                console.log('第一个数据项的奖金字段:', realData[0]["奖金"], '总奖金字段:', realData[0]["总奖金"]);
                console.log('第一个数据项的所有字段:', Object.keys(realData[0]));
            }
            
            // 检查数据格式，处理新旧数据格式差异
            this.horses = realData.map((horse, index) => {
                // 检查数据格式，处理奖金字段的差异
                let earningsValue = 0;
                if (typeof horse["奖金"] !== "undefined") {
                    // 旧格式，奖金字段
                    earningsValue = horse["奖金"];
                    console.log(`第${index}匹马的奖金（旧格式）:`, earningsValue);
                } else if (typeof horse["总奖金"] !== "undefined") {
                    // 新格式，总奖金字段
                    earningsValue = horse["总奖金"];
                    console.log(`第${index}匹马的奖金（新格式）:`, earningsValue);
                } else if (typeof horse["奖金(円)"] !== "undefined") {
                    // 其他可能格式
                    earningsValue = horse["奖金(円)"];
                    console.log(`第${index}匹马的奖金（其他格式）:`, earningsValue);
                } else {
                    // 如果都没有，使用默认值
                    earningsValue = 0;
                    console.log(`第${index}匹马没有奖金字段`);
                }
                
                // 检查必要的字段是否存在
                const horseData = {
                    id: `H${String(index).padStart(4, '0')}`,
                    name: horse["马匹名称（日文名）"] || horse["name"] || "未知",
                    jockey: horse["骑师姓名"] || horse["jockey"] || "未知",
                    year: horse["出生年份"] || horse["year"] || 0,
                    wins: horse["胜场数"] || horse["wins"] || 0,
                    races: horse["参赛数"] || horse["races"] || 0,
                    winRate: horse["胜率"] || horse["winRate"] || 0,
                    birthYear: horse["出生年份"] || horse["birthYear"] || 0,
                    breed: horse["品种"] || horse["breed"] || "未知",
                    color: horse["毛色"] || horse["color"] || "未知",
                    height: horse["身高"] ? `${horse["身高"]}cm` : horse["height"] || "未知",
                    weight: horse["体重"] ? `${horse["体重"]}kg` : horse["weight"] || "未知",
                    trainer: horse["训练师"] || horse["trainer"] || "未知",
                    earnings: earningsValue, // 保存原始数值而不是格式化字符串
                    rank: index + 1,
                    careerLength: horse["生涯年数"] || horse["careerLength"] || 0
                };
                
                console.log(`第${index}匹马转换后:`, horseData.name, '奖金:', earningsValue, '字段:', Object.keys(horseData));
                return horseData;
            });
            
            this.jockeys = this.extractJockeys(this.horses);
            console.log('成功加载马匹数据:', this.horses.length, '匹');
            
            // 确保数据完全加载后再触发更新
            this.dataLoaded = true;
            console.log('数据加载完成，耗时:', (Date.now() - startTime) + 'ms');
        } catch (error) {
            console.error('加载真实数据失败:', error);
            // 如果真实数据加载失败，使用后备数据
            this.horses = this.generateMockData();
            this.jockeys = this.extractJockeys(this.horses);
            console.log('使用后备数据，马匹数量:', this.horses.length);
            this.dataLoaded = true;
        }
    }

    generateMockData() {
        // 如果真实数据加载失败，返回一些示例数据
        console.log('使用模拟数据');
        return [
            {
                id: "H0001",
                name: "コパノリッキー（小林历奇）",
                jockey: "武豊",
                year: 2011,
                wins: 15,
                races: 49,
                winRate: 30.61,
                birthYear: 2011,
                breed: "纯血马",
                color: "枣毛",
                height: "165cm",
                weight: "480kg",
                trainer: "藤泽和雄",
                earnings: 993255000,
                rank: 1,
                careerLength: 9
            },
            {
                id: "H0002",
                name: "ロイスブラザーズ（罗伊斯兄弟）",
                jockey: "岩田康诚",
                year: 2012,
                wins: 5,
                races: 19,
                winRate: 26.32,
                birthYear: 2012,
                breed: "纯血马",
                color: "枣毛",
                height: "163cm",
                weight: "470kg",
                trainer: "音无秀孝",
                earnings: 342462000,
                rank: 2,
                careerLength: 4
            },
            {
                id: "H0003",
                name: "ワンダーアキュート（奇锐骏）",
                jockey: "武豊、杜满莱",
                year: 2006,
                wins: 10,
                races: 50,
                winRate: 20.00,
                birthYear: 2006,
                breed: "纯血马",
                color: "枣毛",
                height: "164cm",
                weight: "475kg",
                trainer: "清信幸",
                earnings: 812774000,
                rank: 3,
                careerLength: 12
            },
            {
                id: "H0004",
                name: "サイレンススズカ（无声铃鹿）",
                jockey: "武豊",
                year: 1994,
                wins: 9,
                races: 16,
                winRate: 56.25,
                earnings: 455984000,
                birthYear: 1994,
                breed: "纯血马",
                color: "栗毛",
                height: "163cm",
                weight: "470kg",
                trainer: "北桥修二",
                careerLength: 3
            },
            {
                id: "H0005",
                name: "スペシャルウィーク（特别周）",
                jockey: "武豊",
                year: 1995,
                wins: 10,
                races: 17,
                winRate: 58.82,
                birthYear: 1995,
                earnings: 1092623000,
                breed: "纯血马",
                color: "黑鹿毛（枣毛）",
                height: "164cm",
                weight: "475kg",
                trainer: "白井寿昭",
                careerLength: 3
            },
            {
                id: "H0006",
                name: "ハルウララ（春乌拉拉）",
                jockey: "多位（含武豊等）",
                year: 1996,
                wins: 0,
                races: 113,
                winRate: 0.00,
                earnings: 15789000,
                birthYear: 1996,
                breed: "纯血马",
                color: "枣毛",
                height: "153cm",
                weight: "430kg",
                trainer: "宗石大",
                careerLength: 6
            },
            {
                id: "H0007",
                name: "オグリキャップ（小栗帽）",
                jockey: "武豊",
                year: 1986,
                wins: 22,
                races: 32,
                winRate: 68.75,
                earnings: 762200000,
                birthYear: 1986,
                breed: "纯血马",
                color: "芦毛",
                height: "162cm",
                weight: "460kg",
                trainer: "北原勉",
                careerLength: 4
            },
            {
                id: "H0008",
                name: "トウカイテイオー（东海帝皇）",
                jockey: "安田隆行",
                year: 1988,
                wins: 9,
                races: 12,
                winRate: 75.00,
                earnings: 625633000,
                birthYear: 1988,
                breed: "纯血马",
                color: "枣毛",
                height: "160cm",
                weight: "450kg",
                trainer: "根岸秀正",
                careerLength: 4
            },
            {
                id: "H0009",
                name: "マルゼンスキー（丸善斯基）",
                jockey: "武豊",
                year: 1984,
                wins: 13,
                races: 24,
                winRate: 54.17,
                earnings: 671700000,
                birthYear: 1984,
                breed: "纯血马",
                color: "芦毛",
                height: "165cm",
                weight: "480kg",
                trainer: "根岸秀正",
                careerLength: 4
            },
            {
                id: "H00010",
                name: "フジキセキ（富士奇石）",
                jockey: "武豊",
                birthYear: 1992,
                wins: 4,
                races: 4,
                winRate: 100.00,
                earnings: 184400000,
                breed: "纯血马",
                color: "黑鹿毛",
                height: "163cm",
                weight: "465kg",
                trainer: "渡辺栄",
                careerLength: 3
            },
            {
                id: "H0011",
                name: "ゴールドシップ（黄金船）",
                jockey: "内田博幸",
                birthYear: 2009,
                wins: 17,
                races: 34,
                winRate: 50.00,
                earnings: 1397767000,
                breed: "纯血马",
                color: "深栗毛",
                height: "166cm",
                weight: "480kg",
                trainer: "须贝尚介",
                careerLength: 5
            },
            {
                id: "H0012",
                name: "ウオッカ（伏特加）",
                jockey: "岩田康誠",
                birthYear: 2004,
                wins: 10,
                races: 26,
                winRate: 38.46,
                earnings: 1338767634,
                breed: "纯血马",
                color: "枣毛",
                height: "162cm",
                weight: "470kg",
                trainer: "角居勝",
                careerLength: 5
            },
            {
                id: "H0013",
                name: "ダイワスカーレット（大和赤骥）",
                jockey: "川田将雅",
                birthYear: 2004,
                wins: 8,
                races: 12,
                winRate: 66.67,
                earnings: 1174000000,
                breed: "纯血马",
                color: "栗毛",
                height: "161cm",
                weight: "465kg",
                trainer: "须贝尚介",
                careerLength: 4
            },
            {
                id: "H0014",
                name: "タイキシャトル（大树快车）",
                jockey: "武豊",
                birthYear: 1994,
                wins: 11,
                races: 13,
                winRate: 84.62,
                earnings: 765725000,
                breed: "纯血马",
                color: "栗毛",
                height: "165cm",
                weight: "490kg",
                trainer: "池江泰郎",
                careerLength: 3
            },
            {
                id: "H0015",
                name: "グラスワンダー（草上飞）",
                jockey: "的场博幸",
                birthYear: 1995,
                wins: 8,
                races: 25,
                winRate: 32.00,
                earnings: 1017427000,
                breed: "纯血马",
                color: "枣毛",
                height: "167cm",
                weight: "530kg",
                trainer: "国枝荣",
                careerLength: 5
            },
            {
                id: "H0016",
                name: "ヒシアマゾン（菱亚马逊）",
                jockey: "冈部幸雄",
                birthYear: 1983,
                wins: 13,
                races: 24,
                winRate: 54.17,
                earnings: 473043000,
                breed: "纯血马",
                color: "枣毛",
                height: "162cm",
                weight: "470kg",
                trainer: "根岸秀正",
                careerLength: 4
            },
            {
                id: "H0017",
                name: "メジロマックイーン（目白麦昆）",
                jockey: "河内洋",
                birthYear: 1989,
                wins: 13,
                races: 21,
                winRate: 61.90,
                earnings: 1075000000,
                breed: "纯血马",
                color: "枣毛",
                height: "164cm",
                weight: "504kg",
                trainer: "佐々木健介",
                careerLength: 4
            },
            {
                id: "H0018",
                name: "グランシャノン（神鹰）",
                jockey: "武豊",
                birthYear: 1995,
                wins: 8,
                races: 11,
                winRate: 72.73,
                earnings: 664395000,
                breed: "纯血马",
                color: "枣毛",
                height: "163cm",
                weight: "480kg",
                trainer: "森秀行",
                careerLength: 3
            },
            {
                id: "H0019",
                name: "テイエムオペラオー（好歌剧）",
                jockey: "和田龙二",
                birthYear: 1996,
                wins: 14,
                races: 26,
                winRate: 53.85,
                earnings: 1835189000,
                breed: "纯血马",
                color: "枣毛",
                height: "165cm",
                weight: "486kg",
                trainer: "人员四十三",
                careerLength: 5
            },

            {
                id: "H0020",
                name: "ナリタブライアン（成田白仁）",
                jockey: "和田龙二",
                birthYear: 1991,
                wins: 12,
                races: 21,
                winRate: 57.14,
                earnings: 1026916000,
                breed: "纯血马",
                color: "黑鹿毛",
                height: "164cm",
                weight: "475kg",
                trainer: "根岸秀正",
                careerLength: 4
            },

            {
                id: "H0021",
                name: "シンボリルドルフ（鲁道夫象征）",
                jockey: "中西洋介",
                birthYear: 1981,
                wins: 13,
                races: 15,
                winRate: 86.67,
                earnings: 684820000,
                breed: "纯血马",
                color: "枣毛",
                height: "165cm",
                weight: "480kg",
                trainer: "野平祐二",
                careerLength: 3
            },

            {
                id: "H0022",
                name: "エアグルーヴ（气槽）",
                jockey: "武豊",
                birthYear: 1999,
                wins: 10,
                races: 22,
                winRate: 45.45,
                earnings: 1390300000,
                breed: "纯血马",
                color: "枣毛",
                height: "166cm",
                weight: "470kg",
                trainer: "角居胜",
                careerLength: 5
            },

            {
                id: "H0023",
                name: "セイウンスカイ（青云天空）",
                jockey: "石桥正二",
                birthYear: 1995,
                wins: 7,
                races: 13,
                winRate: 53.85,
                earnings: 610282000,
                breed: "纯血马",
                color: "芦毛",
                height: "163cm",
                weight: "470kg",
                trainer: "西山胜",
                careerLength: 3
            },
            {
                id: "H0024",
                name: "タマモクロス（玉藻十字）",
                jockey: "三浦皇成",
                birthYear: 1984,
                wins: 8,
                races: 18,
                winRate: 44.44,
                earnings: 598676000,
                breed: "纯血马",
                color: "芦毛",
                height: "153cm",
                weight: "456kg",
                trainer: "小原伊佐美",
                careerLength: 3
            },
            {
                id: "H0025",
                name: "ヨシノブクラシック（优秀素质）",
                jockey: "内田博幸",
                birthYear: 1998,
                wins: 7,
                races: 13,
                winRate: 53.85,
                earnings: 554031000,
                breed: "纯血马",
                color: "枣毛",
                height: "164cm",
                weight: "480kg",
                trainer: "藤泽和雄",
                careerLength: 3
            },
            {
                id: "H0026",
                name: "ビワハヤヒデ（琵琶晨光）",
                jockey: "和田龙二",
                birthYear: 1990,
                wins: 10,
                races: 16,
                winRate: 62.50,
                earnings: 888916000,
                breed: "纯血马",
                color: "枣毛",
                height: "167cm",
                weight: "510kg",
                trainer: "浜田光正",
                careerLength: 3
            },
            {
                id: "H0027",
                name: "ヤマニンミー浴（米浴）",
                jockey: "武豊",
                birthYear: 1996,
                wins: 9,
                races: 24,
                winRate: 37.50,
                earnings: 866421000,
                breed: "纯血马",
                color: "枣毛",
                height: "158cm",
                weight: "470kg",
                trainer: "森秀行",
                careerLength: 4
            },
            {
                id: "H0028",
                name: "アグネスタキオン（爱丽速子）",
                jockey: "武豊",
                birthYear: 1998,
                wins: 8,
                races: 8,
                winRate: 100.00,
                earnings: 476461000,
                breed: "纯血马",
                color: "枣毛",
                height: "165cm",
                weight: "480kg",
                trainer: "森秀行",
                careerLength: 2
            },
            {
                id: "H0029",
                name: "ウイニングチケット（胜利奖券）",
                jockey: "柴田政人",
                birthYear: 1990,
                wins: 6,
                races: 14,
                winRate: 42.86,
                earnings: 653270000,
                breed: "纯血马",
                color: "黑鹿毛",
                height: "162cm",
                weight: "470kg",
                trainer: "藤泽和雄",
                careerLength: 3
            },
            {
                id: "H0030",
                name: "エイシンフラッシュ（荣进闪耀）",
                jockey: "内田博幸",
                birthYear: 2007,
                wins: 8,
                races: 25,
                winRate: 32.00,
                earnings: 1255040000,
                breed: "纯血马",
                color: "枣毛",
                height: "164cm",
                weight: "475kg",
                trainer: "池江泰郎",
                careerLength: 5
            },
            {
                id: "H0031",
                name: "アストンマーチャン（真机伶）",
                jockey: "岩田康誠",
                birthYear: 2006,
                wins: 12,
                races: 23,
                winRate: 52.17,
                earnings: 724260000,
                breed: "纯血马",
                color: "枣毛",
                height: "157cm",
                weight: "452kg",
                trainer: "角居胜",
                careerLength: 4
            },
            {
                id: "H0032",
                name: "カワカミプリンセス（川上公主）",
                jockey: "川田将雅",
                birthYear: 2003,
                wins: 5,
                races: 17,
                winRate: 29.41,
                earnings: 350892000,
                breed: "纯血马",
                color: "枣毛",
                height: "160cm",
                weight: "460kg",
                trainer: "西浦胜一",
                careerLength: 3
            },
            {
                id: "H0033",
                name: "ゴールドシティ（黄金城）",
                jockey: "和田龙二",
                birthYear: 1993,
                wins: 13,
                races: 87,
                winRate: 14.94,
                earnings: 610760000,
                breed: "纯血马",
                color: "枣毛",
                height: "165cm",
                weight: "480kg",
                trainer: "北桥修二",
                careerLength: 6
            },
            {
                id: "H0034",
                name: "サクラバクシンオー（樱花进王）",
                jockey: "武豊",
                birthYear: 1989,
                wins: 14,
                races: 21,
                winRate: 66.67,
                earnings: 476145000,
                breed: "纯血马",
                color: "枣毛",
                height: "158cm",
                weight: "462kg",
                trainer: "西浦胜一",
                careerLength: 4
            },
            {
                id: "H0035",
                name: "スイープトウショウ（东商变革）",
                jockey: "角田晃一",
                birthYear: 2002,
                wins: 8,
                races: 24,
                winRate: 33.33,
                earnings: 734255000,
                breed: "纯血马",
                color: "枣毛",
                height: "163cm",
                weight: "475kg",
                trainer: "角居胜",
                careerLength: 3
            },
            {

                id: "H0036",
                name: "スマートファルコン（醒目飞鹰）",
                jockey: "武豊",
                birthYear: 2007,
                wins: 10,
                races: 20,
                winRate: 50.00,
                earnings: 748255000,
                breed: "纯血马",
                color: "枣毛",
                height: "161cm",
                weight: "465kg",
                trainer: "西浦胜一",
                careerLength: 4
            },
            {
                id: "H0037",
                name: "マチカネフクキタ（待兼福来）",
                jockey: "武豊",
                birthYear: 1994,
                wins: 5,
                races: 16,
                winRate: 31.25,
                earnings: 450570000,
                breed: "纯血马",
                color: "枣毛",
                height: "161cm",
                weight: "465kg",
                trainer: "伊藤英二",
                careerLength: 3
            },
            {
                id: "H0038",
                name: "チキメイダイヒョウ（千明代表）",
                jockey: "中西洋平",
                birthYear: 1998,
                wins: 7,
                races: 20,
                winRate: 35.00,
                earnings: 535760000,
                breed: "纯血马",
                color: "枣毛",
                height: "163cm",
                weight: "470kg",
                trainer: "小松利光",
                careerLength: 4
            },
            {
                id: "H0039",
                name: "メイショウドトウ（名将怒涛）",
                jockey: "内田博幸",
                birthYear: 1998,
                wins: 7,
                races: 22,
                winRate: 31.82,
                earnings: 674470000,
                breed: "纯血马",
                color: "枣毛",
                height: "164cm",
                weight: "475kg",
                trainer: "加藤修",
                careerLength: 4
            },
            {
                id: "H0040",
                name: "メジロドーベル（目白多伯）",
                jockey: "武豊",
                birthYear: 1994,
                wins: 10,
                races: 23,
                winRate: 43.48,
                earnings: 1121440000,
                breed: "纯血马",
                color: "枣毛",
                height: "157cm",
                weight: "455kg",
                trainer: "中内秀树",
                careerLength: 5
            },
            {
                id: "H0041",
                name: "マチカネタンホイザ（待兼诗歌剧）",
                jockey: "武豊",
                birthYear: 1989,
                wins: 6,
                races: 22,
                winRate: 27.27,
                earnings: 453640000,
                breed: "纯血马",
                color: "枣毛",
                height: "155cm",
                weight: "450kg",
                trainer: "伊藤英二",
                careerLength: 4
            },
            {
                id: "H0042",
                name: "メジロパーマー（目白善信）",
                jockey: "和田龙二",
                birthYear: 1987,
                wins: 9,
                races: 38,
                winRate: 23.68,
                earnings: 677415000,
                breed: "纯血马",
                color: "枣毛",
                height: "160cm",
                weight: "460kg",
                trainer: "大久保正阳",
                careerLength: 6
            },
            {
                id: "H0043",
                name: "ダイタクヘリオス（大拓太阳神）",
                jockey: "和田龙二",
                birthYear: 1987,
                wins: 10,
                races: 35,
                winRate: 28.57,
                earnings: 564270000,
                breed: "纯血马",
                color: "黑鹿毛",
                height: "156cm",
                weight: "452kg",
                trainer: "根岸正义",
                careerLength: 6
            },
            {
                id: "H0044",
                name: "ツインターボ（双涡轮）",
                jockey: "武豊",
                birthYear: 1988,
                wins: 5,
                races: 21,
                winRate: 23.81,
                earnings: 231520000,
                breed: "纯血马",
                color: "黑毛",
                height: "155cm",
                weight: "450kg",
                trainer: "北桥修二",
                careerLength: 4
            },
            {
                id: "H0045",
                name: "サトノダイヤモンド(里见光钻)",
                jockey: "池添谦一",
                birthYear: 2014,
                wins: 8,
                races: 20,
                winRate: 40.00,
                earnings: 1495091000,
                breed: "纯血马",
                color: "枣毛",
                height: "162cm",
                weight: "468kg",
                trainer: "堀宣行",
                careerLength: 4
            },
            {
                id: "H0046",
                name: "キタサンブラック(北部玄驹)",
                jockey: "池添谦一",
                birthYear: 2014,
                wins: 12,
                races: 20,
                winRate: 60.00,
                earnings: 1816290000,
                breed: "纯血马",
                color: "黑毛",
                height: "161cm",
                weight: "465kg",
                trainer: "友道康夫",
                careerLength: 4
            },
            {
                id: "H0047",
                name: "サクラチヨノオー(樱花千代王)",
                jockey: "武豊",
                birthYear: 1985,
                wins: 5,
                races: 10,
                winRate: 50.00,
                earnings: 215329000,
                breed: "纯血马",
                color: "枣毛",
                height: "158cm",
                weight: "460kg",
                trainer: "根岸正义",
                careerLength: 3
            },
            {
                id: "H0048",
                name: "シリウスシンボル(天狼星象征)",
                jockey: "加藤和宏",
                birthYear: 1982,
                wins: 4,
                races: 15,
                winRate: 26.67,
                earnings: 326660000,
                breed: "纯血马",
                color: "枣毛",
                height: "162cm",
                weight: "468kg",
                trainer: "二本柳俊夫",
                careerLength: 4
            },
            {
                id: "H0049",
                name: "メジロアルダン(目白阿尔丹)",
                jockey: "冈部幸雄",
                birthYear: 1985,
                wins: 4,
                races: 14,
                winRate: 28.57,
                earnings: 241400000,
                breed: "纯血马",
                color: "枣毛",
                height: "160cm",
                weight: "458kg",
                trainer: "田边秀树",
                careerLength: 3
            },
            {
                id: "H0050",
                name: "ヤエムスケ(八重无敌)",
                jockey: "内田博幸",
                birthYear: 1985,
                wins: 8,
                races: 23,
                winRate: 34.78,
                earnings: 302440000,
                breed: "纯血马",
                color: "枣毛",
                height: "161cm",
                weight: "462kg",
                trainer: "小松利光",
                careerLength: 5
            },
            {
                id: "H0051",
                name: "ツルマルツヨシ(鹤丸刚志)",
                jockey: "武豊",
                birthYear: 1995,
                wins: 7,
                races: 24,
                winRate: 29.17,
                earnings: 421510000,
                breed: "纯血马",
                color: "枣毛",
                height: "160cm",
                weight: "460kg",
                trainer: "小松利光",
                careerLength: 4
            }
        ];
    }

    extractJockeys(horses) {
        const jockeys = new Set();
        horses.forEach(horse => jockeys.add(horse.jockey));
        return Array.from(jockeys);
    }

    searchByJockey(jockeyName) {
        return this.horses.filter(horse => 
            horse.jockey.toLowerCase().includes(jockeyName.toLowerCase())
        );
    }

    searchByHorse(horseName) {
        return this.horses.filter(horse => 
            horse.name.toLowerCase().includes(horseName.toLowerCase())
        );
    }

    searchByBoth(jockeyName, horseName) {
        return this.horses.filter(horse => 
            horse.jockey.toLowerCase().includes(jockeyName.toLowerCase()) &&
            horse.name.toLowerCase().includes(horseName.toLowerCase())
        );
    }

    getStats() {
        return {
            totalHorses: this.horses.length,
            totalJockeys: this.jockeys.length,
            totalRaces: this.horses.reduce((sum, horse) => sum + horse.races, 0)
        };
    }
}

class JRASearchApp {
    constructor() {
        this.database = new JRADatabase();
        this.currentSection = 'home';
        this.loadStartTime = Date.now();
        this.initializeElements();
        this.bindEvents();
        
        // 等待数据加载完成后更新统计和排行榜
        this.waitForDataLoad().then(() => {
            console.log('数据加载完成，开始更新统计和排行榜');
            this.updateStats();
            this.loadRankings();
            
            // 检查数据是否正确加载
            console.log('当前数据库中的马匹数量:', this.database.horses.length);
            if (this.database.horses.length > 0) {
                console.log('第一个马匹:', this.database.horses[0]);
                console.log('最后几个马匹:', this.database.horses.slice(-3));
            }
            
            // 确保数据页面显示完整数据
            if (this.currentSection === 'data') {
                this.loadData();
            }
            
            // 初始化评论系统
            this.initializeComments();
        });
    }

    async waitForDataLoad() {
        console.log('等待数据加载...');
        let attempts = 0;
        const maxAttempts = 50;
        
        while (!this.database.dataLoaded && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
            console.log(`等待数据加载...尝试次数: ${attempts}`);
        }
        
        if (!this.database.dataLoaded) {
            console.error('数据加载超时');
        } else {
            console.log('数据加载完成');
        }
    }

    initializeElements() {
        this.jockeySearch = document.getElementById('jockey-search');
        this.horseSearch = document.getElementById('horse-search');
        this.searchBtn = document.getElementById('search-btn');
        this.resetBtn = document.getElementById('reset-btn');
        this.resultsList = document.getElementById('results-list');
        this.statsElements = document.querySelectorAll('.stat-value');
        this.navLinks = document.querySelectorAll('.nav-links a');
        this.dataGrid = document.getElementById('data-grid');
        this.yearFilter = document.getElementById('year-filter');
        this.breedFilter = document.getElementById('breed-filter');
        this.tabButtons = document.querySelectorAll('.tab-btn');
        this.rankingLists = document.querySelectorAll('.ranking-list');
        
        // 确保元素存在
        if (!this.navLinks || this.navLinks.length === 0) {
            console.error('导航链接未找到');
        }
        if (!this.dataGrid) {
            console.error('数据网格未找到');
        }
        if (!this.yearFilter) {
            console.error('年份筛选器未找到');
        }
        if (!this.breedFilter) {
            console.error('品种筛选器未找到');
        }
        if (!this.tabButtons || this.tabButtons.length === 0) {
            console.error('排行榜标签未找到');
        }
        if (!this.rankingLists || this.rankingLists.length === 0) {
            console.error('排行榜列表未找到');
        }
    }

    bindEvents() {
        this.searchBtn.addEventListener('click', () => this.handleSearch());
        this.resetBtn.addEventListener('click', () => this.resetSearch());
        this.jockeySearch.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleSearch();
        });
        this.horseSearch.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleSearch();
        });

        // 导航事件
        if (this.navLinks) {
            this.navLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const page = link.getAttribute('data-page');
                    if (page) {
                        this.switchPage(page);
                    } else {
                        console.error('导航链接缺少data-page属性');
                    }
                });
            });
        }

        // 数据筛选事件
        if (this.yearFilter) {
            this.yearFilter.addEventListener('change', () => this.loadData());
        }
        if (this.breedFilter) {
            this.breedFilter.addEventListener('change', () => this.loadData());
        }

        // 排行榜标签事件
        if (this.tabButtons) {
            this.tabButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const tab = button.getAttribute('data-tab');
                    if (tab) {
                        this.switchRankingTab(tab);
                    } else {
                        console.error('排行榜标签缺少data-tab属性');
                    }
                });
            });
        }
    }

    switchPage(page) {
        // 隐藏所有页面
        const sections = {
            'home': 'home-section',
            'data': 'data-section', 
            'rankings': 'rankings-section',
            'about': 'about-section'
        };

        Object.values(sections).forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section) {
                section.style.display = 'none';
            } else {
                console.error(`页面元素 ${sectionId} 未找到`);
            }
        });

        // 更新导航状态
        if (this.navLinks) {
            this.navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('data-page') === page) {
                    link.classList.add('active');
                }
            });
        }

        // 显示对应页面
        const targetSectionId = sections[page];
        if (targetSectionId) {
            const targetSection = document.getElementById(targetSectionId);
            if (targetSection) {
                targetSection.style.display = 'block';
                
                // 如果是数据页面，确保数据已加载
                if (page === 'data') {
                    // 如果数据已加载，立即显示
                    if (this.database.dataLoaded) {
                        this.loadData();
                    } else {
                        // 如果数据尚未加载，等待加载完成后再显示
                        this.waitForDataLoad().then(() => {
                            this.loadData();
                        });
                    }
                }
                
                // 如果是关于我们页面，初始化评论系统
                if (page === 'about') {
                    if (this.database.dataLoaded) {
                        this.initializeComments();
                    } else {
                        // 如果数据尚未加载，等待加载完成后再初始化评论
                        this.waitForDataLoad().then(() => {
                            this.initializeComments();
                        });
                    }
                }
            } else {
                console.error(`目标页面 ${targetSectionId} 未找到`);
            }
        } else {
            console.error(`未知的页面: ${page}`);
        }

        this.currentSection = page;
    }

    switchRankingTab(tab) {
        // 更新标签状态
        if (this.tabButtons) {
            this.tabButtons.forEach(button => {
                button.classList.remove('active');
                if (button.getAttribute('data-tab') === tab) {
                    button.classList.add('active');
                }
            });
        }

        // 显示对应内容
        if (this.rankingLists) {
            this.rankingLists.forEach(list => {
                list.style.display = 'none';
            });
            
            const targetList = document.getElementById(`${tab}-rankings`);
            if (targetList) {
                targetList.style.display = 'block';
            } else {
                console.error(`排行榜列表 ${tab}-rankings 未找到`);
            }
        }
    }

    handleSearch() {
        const jockeyName = this.jockeySearch.value.trim();
        const horseName = this.horseSearch.value.trim();

        if (!jockeyName && !horseName) {
            this.showNotification('请输入搜索条件', 'error');
            return;
        }

        this.showLoading();
        
        // 模拟异步搜索
        setTimeout(() => {
            let results = [];
            
            if (jockeyName && horseName) {
                results = this.database.searchByBoth(jockeyName, horseName);
            } else if (jockeyName) {
                results = this.database.searchByJockey(jockeyName);
            } else {
                results = this.database.searchByHorse(horseName);
            }

            this.displayResults(results);
            this.hideLoading();
        }, 500);
    }

    resetSearch() {
        this.jockeySearch.value = '';
        this.horseSearch.value = '';
        this.resultsList.innerHTML = '';
        this.showNotification('搜索已重置', 'success');
    }

    loadData() {
        const yearFilter = this.yearFilter.value;
        const breedFilter = this.breedFilter.value;
        
        let data = this.database.horses;

        if (yearFilter) {
            const [startYear, endYear] = yearFilter.split('-').map(Number);
            data = data.filter(horse => horse.year >= startYear && horse.year <= endYear);
        }

        if (breedFilter) {
            data = data.filter(horse => horse.breed === breedFilter);
        }

        this.displayData(data);
    }

    displayData(data) {
        this.dataGrid.innerHTML = '';

        if (data.length === 0) {
            this.dataGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <h3>未找到相关数据</h3>
                    <p>请尝试其他筛选条件</p>
                </div>
            `;
            return;
        }

        // 显示所有数据而不是限制数量
        data.forEach(horse => {
            const dataItem = document.createElement('div');
            dataItem.className = 'data-item';
            dataItem.innerHTML = `
                <div class="horse-name">${horse.name}</div>
                <div class="horse-info">
                    <span><strong>騎手:</strong> ${horse.jockey}</span>
                    <span><strong>品種:</strong> ${horse.breed}</span>
                    <span><strong>毛色:</strong> ${horse.color}</span>
                    <span><strong>出生年:</strong> ${horse.birthYear}</span>
                </div>
                <div class="horse-stats">
                    <span><strong>勝場:</strong> ${horse.wins}</span>
                    <span><strong>出場:</strong> ${horse.races}</span>
                    <span><strong>勝率:</strong> ${horse.winRate}%</span>
                    <span><strong>獎金:</strong> ${(horse.earnings / 1000000).toFixed(1)}百万円</span>
                    <span><strong>生涯:</strong> ${horse.careerLength}年</span>
                </div>
            `;
            this.dataGrid.appendChild(dataItem);
        });
    }

    loadRankings() {
        console.log('开始加载排行榜，当前数据库中的马匹数量:', this.database.horses.length);
        
        // 胜率排行
        const winRateRankings = this.database.horses
            .sort((a, b) => parseFloat(b.winRate) - parseFloat(a.winRate))
            .slice(0, this.database.horses.length); // 显示所有数据而不是限制数量

        console.log('胜率排行数据:', winRateRankings.length, '匹');
        winRateRankings.forEach((horse, index) => {
            console.log(`胜率排行 #${index + 1}:`, horse.name, horse.winRate);
        });

        const winRateList = document.getElementById('win-rate-rankings');
        winRateList.innerHTML = '<h3>胜率排行 TOP 50</h3>';
        
        winRateRankings.forEach((horse, index) => {
            const rankingItem = document.createElement('div');
            rankingItem.className = 'ranking-item';
            rankingItem.innerHTML = `
                <div class="ranking-number">#${index + 1}</div>
                <div class="horse-info">
                    <div class="horse-name">${horse.name}</div>
                    <div class="horse-stats">
                        <span>胜率: ${horse.winRate}%</span>
                        <span>胜场: ${horse.wins}</span>
                        <span>参赛: ${horse.races}</span>
                    </div>
                </div>
            `;
            winRateList.appendChild(rankingItem);
        });

        // 奖金排行
        const earningsRankings = this.database.horses
            .sort((a, b) => {
                // 使用原始奖金数值进行比较
                const earningsA = parseFloat(a.earnings);
                const earningsB = parseFloat(b.earnings);
                return earningsB - earningsA;
            })
            .slice(0, this.database.horses.length); // 显示所有数据而不是限制数量

        console.log('奖金排行数据:', earningsRankings.length, '匹');
        earningsRankings.forEach((horse, index) => {
            console.log(`奖金排行 #${index + 1}:`, horse.name, horse.earnings);
        });

        const earningsList = document.getElementById('earnings-rankings');
        earningsList.innerHTML = '<h3>奖金排行 TOP 50</h3>';
        
        earningsRankings.forEach((horse, index) => {
            const rankingItem = document.createElement('div');
            rankingItem.className = 'ranking-item';
            rankingItem.innerHTML = `
                <div class="ranking-number">#${index + 1}</div>
                <div class="horse-info">
                    <div class="horse-name">${horse.name}</div>
                    <div class="horse-stats">
                        <span>奖金: ${(horse.earnings / 1000000).toFixed(1)}百万円</span>
                        <span>胜场: ${horse.wins}</span>
                        <span>参赛: ${horse.races}</span>
                    </div>
                </div>
            `;
            earningsList.appendChild(rankingItem);
        });

        // 参赛排行
        const racesRankings = this.database.horses
            .sort((a, b) => b.races - a.races)
            .slice(0, this.database.horses.length); // 显示所有数据而不是限制数量

        console.log('参赛排行数据:', racesRankings.length, '匹');
        racesRankings.forEach((horse, index) => {
            console.log(`参赛排行 #${index + 1}:`, horse.name, horse.races);
        });

        const racesList = document.getElementById('races-rankings');
        racesList.innerHTML = '<h3>参赛排行 TOP 50</h3>';
        
        racesRankings.forEach((horse, index) => {
            const rankingItem = document.createElement('div');
            rankingItem.className = 'ranking-item';
            rankingItem.innerHTML = `
                <div class="ranking-number">#${index + 1}</div>
                <div class="horse-info">
                    <div class="horse-name">${horse.name}</div>
                    <div class="horse-stats">
                        <span>参赛: ${horse.races}</span>
                        <span>胜场: ${horse.wins}</span>
                        <span>胜率: ${horse.winRate}%</span>
                    </div>
                </div>
            `;
            racesList.appendChild(rankingItem);
        });
    }

    displayResults(results) {
        this.resultsList.innerHTML = '';

        if (results.length === 0) {
            this.resultsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <h3>未找到相关数据</h3>
                    <p>请尝试其他搜索条件</p>
                </div>
            `;
            return;
        }

        // 显示所有搜索结果
        results.forEach(horse => {
            const resultItem = document.createElement('div');
            resultItem.className = 'result-item';
            resultItem.innerHTML = `
                <div class="horse-info">
                    <div class="horse-name">${horse.name}</div>
                    <div class="jockey-name">騎手: ${horse.jockey}</div>
                    <div class="horse-detail">
                        <strong>品種:</strong> ${horse.breed} | 
                        <strong>毛色:</strong> ${horse.color} | 
                        <strong>身高:</strong> ${horse.height} | 
                        <strong>体重:</strong> ${horse.weight} | 
                        <strong>出生年:</strong> ${horse.birthYear}
                    </div>
                </div>
                <div class="horse-stats">
                    <div class="stat">
                        <strong>勝場:</strong> ${horse.wins}
                    </div>
                    <div class="stat">
                        <strong>出場:</strong> ${horse.races}
                    </div>
                    <div class="stat">
                        <strong>勝率:</strong> ${horse.winRate}%
                    </div>
                    <div class="stat">
                        <strong>獎金:</strong> ${(horse.earnings / 1000000).toFixed(1)}百万円
                    </div>
                    <div class="stat">
                        <strong>排名:</strong> #${horse.rank}
                    </div>
                    <div class="stat">
                        <strong>生涯:</strong> ${horse.careerLength}年
                    </div>
                </div>
            `;
            this.resultsList.appendChild(resultItem);
        });
    }

    updateStats() {
        const stats = this.database.getStats();
        this.statsElements[0].textContent = stats.totalHorses;
        this.statsElements[1].textContent = stats.totalJockeys;
        this.statsElements[2].textContent = stats.totalRaces;
    }

    // 评论功能
    initializeComments() {
        this.commentsContainer = document.getElementById('comments-container');
        this.commentName = document.getElementById('comment-name');
        this.commentText = document.getElementById('comment-text');
        this.submitCommentBtn = document.getElementById('submit-comment');
        
        if (this.commentsContainer && this.commentName && this.commentText && this.submitCommentBtn) {
            this.bindCommentEvents();
            this.loadComments();
        } else {
            console.error('评论系统元素未找到');
        }
    }

    bindCommentEvents() {
        this.submitCommentBtn.addEventListener('click', () => this.handleCommentSubmit());
        
        // 支持Enter键提交评论
        this.commentText.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleCommentSubmit();
            }
        });
    }

    handleCommentSubmit() {
        const name = this.commentName.value.trim();
        const text = this.commentText.value.trim();
        
        if (!name || !text) {
            this.showNotification('请填写姓名和评论内容', 'error');
            return;
        }
        
        const comment = {
            id: Date.now(),
            name: name,
            text: text,
            date: new Date().toISOString(),
            replies: []
        };
        
        this.addComment(comment);
        this.saveComment(comment);
        
        // 清空表单
        this.commentName.value = '';
        this.commentText.value = '';
        
        this.showNotification('评论提交成功！', 'success');
    }

    addComment(comment, parentElement = null) {
        const commentItem = document.createElement('div');
        commentItem.className = 'comment-item';
        commentItem.dataset.id = comment.id;
        
        const date = new Date(comment.date);
        const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
        
        let repliesHtml = '';
        if (comment.replies && comment.replies.length > 0) {
            repliesHtml = '<div class="replies-container">';
            comment.replies.forEach(reply => {
                repliesHtml += this.createReplyHtml(reply, comment.id);
            });
            repliesHtml += '</div>';
        }
        
        commentItem.innerHTML = `
            <div class="comment-header">
                <span class="comment-author">${comment.name}</span>
                <span class="comment-date">${formattedDate}</span>
                ${comment.replies && comment.replies.length > 0 ? '<span class="reply-indicator">有回复</span>' : ''}
            </div>
            <div class="comment-text">${this.escapeHtml(comment.text)}</div>
            <button class="reply-btn" onclick="window.app.startReply(${comment.id})">回复</button>
            ${repliesHtml}
        `;
        
        if (parentElement) {
            parentElement.appendChild(commentItem);
        } else {
            this.commentsContainer.appendChild(commentItem);
        }
    }

    createReplyHtml(reply, parentId) {
        const date = new Date(reply.date);
        const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
        
        return `
            <div class="comment-item" data-id="${reply.id}">
                <div class="comment-header">
                    <span class="comment-author">${reply.name}</span>
                    <span class="comment-date">${formattedDate}</span>
                </div>
                <div class="comment-text">${this.escapeHtml(reply.text)}</div>
            </div>
        `;
    }

    startReply(parentId) {
        // 隐藏所有回复表单
        document.querySelectorAll('.reply-form').forEach(form => {
            form.classList.remove('active');
        });
        
        // 查找目标评论项
        const commentItem = document.querySelector(`.comment-item[data-id="${parentId}"]`);
        if (!commentItem) return;
        
        // 创建或获取回复表单
        let replyForm = commentItem.querySelector('.reply-form');
        if (!replyForm) {
            replyForm = document.createElement('div');
            replyForm.className = 'reply-form';
            replyForm.innerHTML = `
                <h5>回复评论</h5>
                <input type="text" id="reply-name-${parentId}" placeholder="您的姓名" required>
                <textarea id="reply-text-${parentId}" placeholder="请输入您的回复..." rows="3" required></textarea>
                <div class="button-group">
                    <button class="btn reply-btn" onclick="window.app.handleReplySubmit(${parentId})">提交回复</button>
                    <button class="btn cancel-reply" onclick="window.app.cancelReply(${parentId})">取消</button>
                </div>
            `;
            commentItem.appendChild(replyForm);
        }
        
        // 显示回复表单
        replyForm.classList.add('active');
        
        // 聚焦到回复文本框
        const replyText = document.getElementById(`reply-text-${parentId}`);
        if (replyText) {
            replyText.focus();
        }
    }

    handleReplySubmit(parentId) {
        const name = document.getElementById(`reply-name-${parentId}`).value.trim();
        const text = document.getElementById(`reply-text-${parentId}`).value.trim();
        
        if (!name || !text) {
            this.showNotification('请填写姓名和回复内容', 'error');
            return;
        }
        
        const reply = {
            id: Date.now(),
            name: name,
            text: text,
            date: new Date().toISOString()
        };
        
        this.addReply(parentId, reply);
        this.saveReply(parentId, reply);
        
        // 隐藏并清空回复表单
        this.cancelReply(parentId);
        
        this.showNotification('回复提交成功！', 'success');
    }

    addReply(parentId, reply) {
        // 添加回复到DOM
        const commentItem = document.querySelector(`.comment-item[data-id="${parentId}"]`);
        if (!commentItem) return;
        
        let repliesContainer = commentItem.querySelector('.replies-container');
        if (!repliesContainer) {
            repliesContainer = document.createElement('div');
            repliesContainer.className = 'replies-container';
            commentItem.appendChild(repliesContainer);
        }
        
        const replyItem = document.createElement('div');
        replyItem.className = 'comment-item';
        replyItem.dataset.id = reply.id;
        
        const date = new Date(reply.date);
        const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
        
        replyItem.innerHTML = `
            <div class="comment-header">
                <span class="comment-author">${reply.name}</span>
                <span class="comment-date">${formattedDate}</span>
            </div>
            <div class="comment-text">${this.escapeHtml(reply.text)}</div>
        `;
        
        repliesContainer.appendChild(replyItem);
        
        // 添加回复指示器
        const commentHeader = commentItem.querySelector('.comment-header');
        if (commentHeader) {
            const existingIndicator = commentHeader.querySelector('.reply-indicator');
            if (!existingIndicator) {
                commentHeader.innerHTML += '<span class="reply-indicator">有回复</span>';
            }
        }
    }

    saveReply(parentId, reply) {
        // 从localStorage加载评论
        const savedComments = localStorage.getItem('jraComments');
        let comments = [];
        
        if (savedComments) {
            try {
                comments = JSON.parse(savedComments);
            } catch (error) {
                console.error('解析现有评论失败:', error);
                return;
            }
        }
        
        // 查找父评论并添加回复
        const addReplyToComment = (commentList) => {
            for (let comment of commentList) {
                if (comment.id === parentId) {
                    if (!comment.replies) {
                        comment.replies = [];
                    }
                    comment.replies.push(reply);
                    return true;
                }
                if (comment.replies && comment.replies.length > 0) {
                    if (addReplyToComment(comment.replies)) {
                        return true;
                    }
                }
            }
            return false;
        };
        
        addReplyToComment(comments);
        
        // 限制评论数量（最多保存50条）
        if (comments.length > 50) {
            comments = comments.slice(-50);
        }
        
        try {
            localStorage.setItem('jraComments', JSON.stringify(comments));
        } catch (error) {
            console.error('保存回复失败:', error);
        }
    }

    cancelReply(parentId) {
        const replyForm = document.querySelector(`.reply-form[data-id="${parentId}"]`);
        if (replyForm) {
            replyForm.classList.remove('active');
        }
        
        // 清空回复表单
        document.getElementById(`reply-name-${parentId}`).value = '';
        document.getElementById(`reply-text-${parentId}`).value = '';
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    loadComments() {
        // 从localStorage加载评论
        const savedComments = localStorage.getItem('jraComments');
        if (savedComments) {
            try {
                const comments = JSON.parse(savedComments);
                comments.forEach(comment => this.addComment(comment));
            } catch (error) {
                console.error('加载评论失败:', error);
            }
        }
    }

    saveComment(comment) {
        // 保存到localStorage
        const savedComments = localStorage.getItem('jraComments');
        let comments = [];
        
        if (savedComments) {
            try {
                comments = JSON.parse(savedComments);
            } catch (error) {
                console.error('解析现有评论失败:', error);
            }
        }
        
        comments.push(comment);
        
        // 限制评论数量（最多保存50条）
        if (comments.length > 50) {
            comments = comments.slice(-50);
        }
        
        try {
            localStorage.setItem('jraComments', JSON.stringify(comments));
        } catch (error) {
            console.error('保存评论失败:', error);
        }
    }

    showLoading() {
        this.resultsList.innerHTML = '<div class="loading"></div>';
    }

    hideLoading() {
        // 加载动画会在显示结果时被替换
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideIn 0.3s ease-out reverse';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new JRASearchApp();
    
    // 添加调试信息显示
    setTimeout(() => {
        const app = window.app;
        if (app && app.database) {
            const horses = app.database.horses;
            const stats = app.database.getStats();
            console.log('最终加载的马匹数量:', horses.length);
            console.log('数据库统计:', stats);
            console.log('前5匹马:', horses.slice(0, 5));
            console.log('后5匹马:', horses.slice(-5));
            
            // 在页面上显示调试信息
            const debugInfo = `
                <div style="position: fixed; top: 10px; right: 10px; background: rgba(255,255,255,0.9); padding: 10px; border: 1px solid #ccc; border-radius: 5px; font-family: monospace; z-index: 1000;">
                    <div>加载时间: ${(Date.now() - window.app.loadStartTime) / 1000}秒</div>
                    <div>马匹总数: ${horses.length}</div>
                    <div>骑师数量: ${stats.totalJockeys}</div>
                    <div>比赛场次: ${stats.totalRaces}</div>
                    <div>数据加载状态: ${app.database.dataLoaded ? '完成' : '未完成'}</div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', debugInfo);
        }
    }, 2000);
});