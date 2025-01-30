package service

import (
	"errors"
	"server/dal/model"
	"server/dal/query"
)

type UserService struct {
	q *query.Query
}

func NewUserService(q *query.Query) *UserService {
	return &UserService{q: q}
}

// CreateUser 创建用户
func (s *UserService) CreateUser(user *model.User) error {
	return s.q.User.Create(user)
}

// GetUserByID 通过ID获取用户
func (s *UserService) GetUserByID(id int64) (*model.User, error) {
	user, err := s.q.User.Where(s.q.User.ID.Eq(id)).First()
	if err != nil {
		return nil, err
	}
	return user, nil
}

// GetUserByUsername 通过用户名获取用户
func (s *UserService) GetUserByUsername(username string) (*model.User, error) {
	user, err := s.q.User.Where(s.q.User.Username.Eq(username)).First()
	if err != nil {
		return nil, err
	}
	return user, nil
}

// UpdateUser 更新用户信息
func (s *UserService) UpdateUser(user *model.User) error {
	if user.ID == 0 {
		return errors.New("user id is required")
	}
	_, err := s.q.User.Where(s.q.User.ID.Eq(user.ID)).Updates(user)
	return err
}

// DeleteUser 删除用户
func (s *UserService) DeleteUser(id int64) error {
	_, err := s.q.User.Where(s.q.User.ID.Eq(id)).Delete()
	return err
}

// ListUsers 获取用户列表
func (s *UserService) ListUsers(page, pageSize int) ([]*model.User, error) {
	offset := (page - 1) * pageSize
	users, err := s.q.User.Offset(offset).Limit(pageSize).Find()
	if err != nil {
		return nil, err
	}
	return users, nil
}

// CountUsers 获取用户总数
func (s *UserService) CountUsers() (int64, error) {
	return s.q.User.Count()
}
