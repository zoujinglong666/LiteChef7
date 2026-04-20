#!/bin/bash
# LiteChef7 云开发数据库初始化脚本

echo "📦 LiteChef7 数据库初始化"
echo "=============================="

# 检查是否安装了微信云开发 CLI
if ! command -v tcb &> /dev/null; then
    echo "❌ 请先安装腾讯云开发 CLI: npm install -g @cloudbase/cli"
    exit 1
fi

# 云环境ID
ENV_ID="cloud1-2grw3bbx061c1340"

# 需要创建的集合列表
COLLECTIONS=(
    "user-info"
    "recipe"
    "comment"
    "post"
    "follow"
    "challenge"
)

echo "📁 环境: $ENV_ID"
echo ""

# 创建集合
for collection in "${COLLECTIONS[@]}"; do
    echo "📝 创建集合: $collection"
    tcb db createCollection $collection -e $ENV_ID
    if [ $? -eq 0 ]; then
        echo "✅ $collection 创建成功"
    else
        echo "⚠️ $collection 已存在或创建失败"
    fi
    echo ""
done

echo "=============================="
echo "✅ 初始化完成！"
echo ""
echo "📋 集合列表:"
for collection in "${COLLECTIONS[@]}"; do
    echo "   - $collection"
done
