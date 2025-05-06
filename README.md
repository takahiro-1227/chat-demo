# リアルタイムチャットアプリ デモ

トーク画面を開いている時、リアルタイムでメッセージを受信できるチャットアプリです。  
WebSocket で実装しています。

## 前提

MySQL のインストールが必要です。

## セットアップ手順

### リポジトリをクローン

`git clone https://github.com/takahiro-1227/chat-demo.git`  
`cd chat-demo`  
`npm install`

### DBのセットアップ

データベース作成
`CREATE DATABASE chat_demo;`

DATABASE_URL を環境変数として設定  
`cd packages/server`  
`cp .env.example .env`

テーブル作成は prisma のコマンドで行う。  
`cd packages/server`  
`npx prisma db push`

初期データ投入  
`source ./setup.sql`

### 起動

`cd packages/server`  
`npm run dev`

`cd packages/site`  
`npm run dev`

`http://localhost:3000` にブラウザでアクセス！  
taro と kenta の画面を並べて、リアルタイムでチャットが更新されるのを確認できます！
