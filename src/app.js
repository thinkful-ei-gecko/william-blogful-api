require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');
const ArticlesService = require('./articles/articles-service');
const articlesRouter = require('./articles/articles-router');

const app = express();
const jsonParser = express.json();

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());

app.use('/articles', articlesRouter);

app.get('/', (req,res) => {
  res.send('Hello, world!');
});

app.get('/xss', (req, res) => {
  res.cookie('secretToken', '1234567890');
  res.sendFile(__dirname + '/xss-example.html');
});

app.use(function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === 'production') {
    response = { error: { message: 'server error' } };
  } else {
    console.error(error);
    response = { message: error.message, error };
  }
  res.status(500).json(response);
});

module.exports = app;

// app.get('/articles', (req,res,next) => {
//   const knexInstance = req.app.get('db');
//   ArticlesService.getAllArticles(knexInstance)
//     .then(articles => {
//       res.json(articles.map(article => ({
//         id: article.id,
//         title: article.title,
//         style: article.style,
//         content: article.content,
//         date_published: new Date(article.date_published),
//       })));
//     })
//     .catch(next); // we are passing NEXT into the .catch so that any errors get handled by our error handler middleware
// });

// app.get('/articles/:article_id', (req,res,next) => {
//   const knexInstance = req.app.get('db');
//   ArticlesService.getById(knexInstance, req.params.article_id)
//     .then(article => {
//       if(!article) {
//         return res.status(404).json({
//           error: { message: 'Articles doesn\'t exist' }
//         });
//       }
//       res.json({
//         id: article.id,
//         title: article.title,
//         style: article.style,
//         content: article.content,
//         date_published: new Date(article.date_published),
//       });
//     })
//     .catch(next);
// });

// app.post('/articles', jsonParser, (req,res,next) => {
//   const { title, content, style } = req.body;
//   const newArticle = { title, content, style };
//   const db = req.app.get('db');
//   ArticlesService.insertArticle(db,newArticle)
//     .then(article => {
//       res.status(201).location(`/articles/${article.id}`).json(article);
//     })
//     .catch(next);
// });