const express = require('express');

// 3.2) User route handler
const getAllUsers = (req, res) => {
  res.status(500).json({
    status: 'Error',
    message: 'routes are not handled yet',
  });
};

const getUser = (req, res) => {
  res.status(500).json({
    status: 'Error',
    message: 'routes are not handled yet',
  });
};
const createUser = (req, res) => {
  res.status(500).json({
    status: 'Error',
    message: 'routes are not handled yet',
  });
};
const updateUser = (req, res) => {
  res.status(500).json({
    status: 'Error',
    message: 'routes are not handled yet',
  });
};
const deleteUser = (req, res) => {
  res.status(500).json({
    status: 'Error',
    message: 'routes are not handled yet',
  });
};
module.exports = { getAllUsers, getUser, createUser, deleteUser, updateUser };
