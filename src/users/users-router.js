const path = require('path');
const express = require('express');
const xss = require('xss');
const UsersService = require('./users-service');

const usersRouter = express.Router();
const jsonParser = express.json();

const serializeUser = user => ({
  id: user.id,
  fullname: xss(user.fullname),
  username: xss(user.username),
  nickname: xss(user.nickname),
  date_created: user.date_created,
});

usersRouter
  .route('/')
  .get((req,res,next) => {
    const db = req.app.get('db');
    UsersService.getAllUsers(db)
      .then(users => {
        res.status(200).json(users.map(serializeUser));
      })
      .catch(next);
  })
  .post(jsonParser, (req,res,next) => {
    const { fullname, username, nickname, password } = req.body;
    const newUser = { fullname, username, nickname, password };
    
    for (const [key, value] of Object.entries(newUser)) {
      if (value == null) {
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        })
      }
    }

    newUser.nickname = nickname;
    newUser.password = password;

    const db = req.app.get('db');
    UsersService.insertUser(db,newUser)
      .then(user => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${user.id}`))
          .json(serializeUser(user));
      })
      .catch(next);
  });

usersRouter
  .route('/:user_id')
  .all((req,res,next) => {
    const db = req.app.get('db');
    const id = req.params.user_id;
    UsersService.getById(db,id)
      .then(user => {
        if(!user) {
          return res.status(404).json( {error: {message: `User doesn't exist`}});
        }
        res.user = user;
        next();
      })
      .catch(next);
  })
  .get((req,res,next) => {
    res.json(serializeUser(res.user));
  })
  .delete((req,res,next) => {
    const db = req.app.get('db');
    const id = req.params.user_id;
    UsersService.deleteUser(db,id)
      .then(() => res.status(204).end())
      .catch(next);
  })
  .patch(jsonParser, (req,res,next) => {
    const { fullname, username, nickname, password } = req.body;
    const userToUpdate = { fullname, username, nickname, password };

    const numberOfValues = Object.values(userToUpdate).filter(Boolean).length;
    if(numberOfValues === 0) {
      return res.status(400).json({
        error: {
          message: `Request body must contain either 'fullname', 'username', 'password' or 'nickname'`
        }
      });
    }

    const db = req.app.get('db');
    const id = req.params.user_id;
    UsersService.updateUser(db,id,userToUpdate)
      .then(() => res.status(204).end())
      .catch(next);
  });

module.exports = usersRouter;