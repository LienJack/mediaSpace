package dal

import (
	"gorm.io/driver/mysql"
	"gorm.io/gen"
	"gorm.io/gorm"
)

// 定义模型结构体
// type User struct {
// 	ID        int64  `gorm:"primarykey"`
// 	Username  string `gorm:"column:username"`
// 	Password  string `gorm:"column:password"`
// 	Email     string `gorm:"column:email"`
// 	CreatedAt string `gorm:"column:created_at"`
// 	UpdatedAt string `gorm:"column:updated_at"`
// }

// type MediaFile struct {
// 	ID        int64  `gorm:"primarykey"`
// 	UserID    int64  `gorm:"column:user_id"`
// 	FileName  string `gorm:"column:file_name"`
// 	FilePath  string `gorm:"column:file_path"`
// 	FileType  string `gorm:"column:file_type"`
// 	FileSize  int64  `gorm:"column:file_size"`
// 	MimeType  string `gorm:"column:mime_type"`
// 	Status    int    `gorm:"column:status"`
// 	CreatedAt string `gorm:"column:created_at"`
// 	UpdatedAt string `gorm:"column:updated_at"`
// }

// 生成代码
func GenerateCode() {
	// 连接数据库
	dsn := "root:root@tcp(127.0.0.1:3306)/media_space?charset=utf8mb4&parseTime=True&loc=Local"
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		panic(err)
	}

	// 初始化生成器
	g := gen.NewGenerator(gen.Config{
		OutPath:      "./dal/query",      // 生成代码的输出目录
		ModelPkgPath: "./dal/model",      // 模型代码的输出目录
		Mode:         gen.WithoutContext, // 生成无需传递 context 的代码
	})

	// 设置目标数据库
	g.UseDB(db)

	// 设置模型生成选项
	g.WithOpts(gen.FieldIgnore("created_at", "updated_at"))

	// 生成所有表的模型和查询代码
	// 为每个表生成对应的查询代码
	g.ApplyBasic(
		g.GenerateModel("users"),
	// g.GenerateModel("media_files"),
	// g.GenerateModel("tags"),
	// g.GenerateModel("media_tags"),
	)

	// 执行生成
	g.Execute()
}
