const express = require('express');
const path = require('path');
const xss = require('xss');
const ArticlesService = require('./articles-service');

const articlesRouter = express.Router();
const jsonParser = express.json();

articlesRouter
  .route('/')
  .get((req,res,next) => {
    const knexInstance = req.app.get('db');
    ArticlesService.getAllArticles(knexInstance)
      .then(articles => {
        res.json(articles.map(article => ({
          id: article.id,
          title: xss(article.title),
          style: article.style,
          content: xss(article.content),
          date_published: new Date(article.date_published),
        })));
      })
      .catch(next); // we are passing NEXT into the .catch so that any errors get handled by our error handler middleware
  })
  .post(jsonParser, (req,res,next) => {
    const { title, content, style } = req.body;
    const newArticle = { title, content, style };
    const db = req.app.get('db');

    for (const [key, value] of Object.entries(newArticle)) {
      if (value == null) {
        return res.status(400).json({error: {message: `Missing ${key} in request body`}});
      }
    }

    ArticlesService.insertArticle(db,newArticle)
      .then(article => {
        res.status(201).location(path.posix.join(req.originalUrl, `/${article.id}`)).json({
          id: article.id,
          title: xss(article.title),
          style: article.style,
          content: xss(article.content),
          date_published: new Date(article.date_published)
        });
      })
      .catch(next);
  });

articlesRouter
  .route('/:article_id')
  .all((req,res,next) => {
    const knexInstance = req.app.get('db');
    const id = req.params.article_id;
    ArticlesService.getById(knexInstance,id)
      .then(article => {
        if(!article) {
          return res.status(404).json({error: {message: 'Article does not exist'}});
        }
        res.article = article;
        next();
      })
      .catch(next);
  })
  .get((req,res,next) => {
    res.json({
      id: res.article.id,
      title: xss(res.article.title),
      style: res.article.style,
      content: xss(res.article.content),
      date_published: new Date(res.article.date_published),
    });
  })
  .delete((req,res,next) => {
    const knexInstance = req.app.get('db');
    const id = req.params.article_id;
    ArticlesService.deleteArticle(knexInstance, id)
      .then(() => {
        res.status(204).end();
      })
      .catch(next);
  })
  .patch(jsonParser, (req,res,next) => {
    const { title, content, style } = req.body;
    const articleToUpdate = { title, content, style };
    const db = req.app.get('db');
    const id = req.params.article_id;

    const numberofValues = Object.values(articleToUpdate).filter(Boolean).length;
    if(numberofValues === 0) {
      return res.status(400).json({error: {message: 'Request body must contain either \'title\', \'style\' or \'content\''}});
    }

    ArticlesService.updateArticle(db,id,articleToUpdate)
      .then(numRowsAffected => {
        return res.status(204).end();
      })
      .catch(next);
  });
  
module.exports = articlesRouter;