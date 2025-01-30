package main

import (
	"log"
	"server/dal"
	"server/dal/query"
	"server/internal/routes"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var db *gorm.DB

var Q *query.Query

func initDB() {
	var err error
	dsn := "root:root@tcp(127.0.0.1:3306)/media_space?charset=utf8mb4&parseTime=True&loc=Local"
	db, err = gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// 生成代码
	dal.GenerateCode()

	// 初始化查询对象
	Q = query.Use(db)
}

func main() {
	// 初始化数据库并生成代码
	initDB()

	// 初始化路由
	r := routes.InitRouter()
	r.Run(":8080") // 监听并在 0.0.0.0:8080 上启动服务
}

// 使用示例
// func example() {
// 	// 查询用户
// 	user, err := Q.User.Where(Q.User.Username.Eq("test")).First()

// 	// 查询媒体文件
// 	files, err := Q.MediaFile.Where(Q.MediaFile.UserID.Eq(1)).Find()
// }
