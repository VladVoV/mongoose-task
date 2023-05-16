import mongoose, {Schema} from 'mongoose';

const articleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        minlength: 5,
        maxlength: 400,
    },
    subtitle: {
        type: String,
        minlength: 5,
    },
    description: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 5000,
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    category: {
        type: String,
        enum: ['sport', 'games', 'history'],
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

const Article = mongoose.model('Article', articleSchema);

export default Article;
