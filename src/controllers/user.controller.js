import User from '../models/user.model.js';
import Article from "../models/article.model.js";

export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({}, 'id fullName email age')
        .sort({ age: 1 })
        .exec();

    res.json(users);
  } catch (err) {
    next(err);
  }
};


export const getUserByIdWithArticles = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id)
        .populate({
          path: 'articles',
          select: 'title subtitle createdAt',
          populate: { path: 'owner', select: 'fullName email age' }
        })
        .select('firstName lastName fullName email age');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    next(err);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const { firstName, lastName, email, role, age } = req.body;

    const user = new User({
      firstName,
      lastName,
      email,
      role,
      age,
    });

    const newUser = await user.save();

    res.status(201).json(newUser);
  } catch (err) {
    next(err);
  }
};

export const updateUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, age } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
        id,
        {
          firstName,
          lastName,
          age,
          fullName: `${firstName} ${lastName}`,
        },
        { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(updatedUser);
  } catch (err) {
    next(err);
  }
};

export const deleteUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const owner = id;

    const result = await User.findByIdAndDelete(id);

    if (!result) {
      return res.status(404).json({ message: 'User not found' });
    }

    await Article.deleteMany({ owner });

    res.json({ message: 'User and associated articles deleted successfully' });
  } catch (err) {
    next(err);
  }
};


