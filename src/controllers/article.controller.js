import Article from '../models/article.model.js';
import User from "../models/user.model.js";

export const getArticles = async (req, res, next) => {
  try {
    const { title = '', page = 1, limit = 10 } = req.query;

    let searchQuery = {};

    if (title !== '') {
      searchQuery = { title: { $regex: `.*${title}.*`, $options: 'i' } };
    }

    const totalArticles = await Article.countDocuments(searchQuery);

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const totalPages = Math.ceil(totalArticles / limit);

    const articles = await Article.find(searchQuery)
        .populate('owner', 'fullName email age')
        .skip(startIndex)
        .limit(limit)
        .exec();

    res.json({
      articles,
      currentPage: page,
      totalPages,
      totalArticles,
    });
  } catch (err) {
    next(err);
  }
};

export const getArticleById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const article = await Article.findById(id)
        .populate('owner', 'fullName email age')
        .exec();

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    res.json(article);
  } catch (err) {
    next(err);
  }
};

export const createArticle = async (req, res, next) => {
  try {
    const { title, subtitle, description, ownerId, category } = req.body;

    const owner = await User.findById(ownerId);
    if (!owner) {
      return res.status(404).json({ message: 'Owner not found' });
    }

    const article = new Article({
      title,
      subtitle,
      description,
      owner: ownerId,
      category,
    });

    const savedArticle = await article.save();

    owner.numberOfArticles += 1;
    await owner.save();

    res.json(savedArticle);
  } catch (err) {
    next(err);
  }
};

export const updateArticleById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, subtitle, description, ownerId, category } = req.body;

    const article = await Article.findById(id);
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    const owner = await User.findById(ownerId);
    if (!owner) {
      return res.status(404).json({ message: 'Owner not found' });
    }

    if (article.owner.toString() !== ownerId) {
      return res.status(403).json({ message: 'Unauthorized to update this article' });
    }

    article.title = title;
    article.subtitle = subtitle;
    article.description = description;
    article.category = category;
    article.updatedAt = new Date();

    const updatedArticle = await article.save();

    res.json(updatedArticle);
  } catch (err) {
    next(err);
  }
};


export const deleteArticleById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { ownerId } = req.body;

    const article = await Article.findById(id);
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    if (article.owner.toString() !== ownerId) {
      return res.status(403).json({ message: 'Unauthorized to delete this article' });
    }

    await User.findByIdAndUpdate(ownerId, { $inc: { numberOfArticles: -1 } });

    await article.deleteOne();

    res.json({ message: 'Article deleted successfully' });
  } catch (err) {
    next(err);
  }
};
