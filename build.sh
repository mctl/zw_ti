#!/bin/bash
# 紫微斗数主星人格测试 - 一键构建脚本
# 用法: ./build.sh

set -e

DIR="$(cd "$(dirname "$0")" && pwd)"
DIST="$DIR/dist"

echo "🔧 开始构建..."

# 1. 清理 dist 目录
rm -rf "$DIST"
mkdir -p "$DIST"

# 2. 复制静态文件
cp "$DIR/index.html" "$DIST/"
cp "$DIR/style.css" "$DIST/"

# 3. 混淆 JS 文件
echo "🔒 混淆 data.src.js..."
javascript-obfuscator "$DIR/data.src.js" --output "$DIST/data.js" \
  --compact true \
  --string-array true \
  --string-array-encoding rc4 \
  --string-array-threshold 0.75 \
  --control-flow-flattening true \
  --control-flow-flattening-threshold 0.5 \
  --dead-code-injection true \
  --dead-code-injection-threshold 0.2 \
  --unicode-escape-sequence true

echo "🔒 混淆 app.src.js..."
javascript-obfuscator "$DIR/app.src.js" --output "$DIST/app.js" \
  --compact true \
  --string-array true \
  --string-array-encoding rc4 \
  --string-array-threshold 0.75 \
  --control-flow-flattening true \
  --control-flow-flattening-threshold 0.5 \
  --dead-code-injection true \
  --dead-code-injection-threshold 0.2 \
  --unicode-escape-sequence true

# 4. 输出结果
echo ""
echo "✅ 构建完成！dist 目录内容："
ls -lh "$DIST"
echo ""
echo "下一步：在 CodeBuddy 中输入「重新部署」即可上线"
