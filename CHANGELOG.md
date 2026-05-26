# Changelog

## v1.0.0 · 2025

### 🎉 首发

- ✨ 97 idol agent · 4 代际 · 36 团
- ✨ Tier 0 全员议会 52 人 (8 大热门 + RV/MAMA/ILLIT/BABYMON)
- ✨ Tier 1 代际 leader 45 人 (2-2.5/3/4/5 代覆盖)
- ✨ 加权陪审团 2/3 表决机制
- ✨ 6 平台一键 installer (自动注册 skillDirectories, 复用算鱼 v4.2.4 成熟版本)
- ✨ /kpop /女团 /idol-congress 斜杠触发

### 🏗 架构

复用 [suanfish-design-system v4.2.4](https://github.com/SuanFishXYY/suanfish-design-system) 议会架构, 把哲学家/艺术家/音乐家圣人池替换为 KPOP 女团 idol。

### 🐛 继承修复

直接继承算鱼 8 大真凶治理:
- description ≤ 1024 字符上限
- settings.json 自动创建 + BOM 安全
- skill name 而非 agent 字段
- 6 平台 junction + 自动注册