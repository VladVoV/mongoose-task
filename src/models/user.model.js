import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        minlength: 4,
        maxlength: 50,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 60,
        trim: true
    },
    fullName: String,
    email: {
        type: String,
        required: true,
        lowercase: true,
        validate: {
            validator: function(email) {
                return /\S+@\S+\.\S+/.test(email);
            },
            message: 'Невірний формат email.'
        }
    },
    role: {
        type: String,
        enum: ['admin', 'writer', 'guest'],
        required: true
    },
        age: {
            type: Number,
            min: 1,
            max: 99,
        },
        numberOfArticles: {
            type: Number,
            default: 0
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        updatedAt: {
            type: Date,
            default: Date.now
        },
        articles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Article' }]
},
{timestamps: true
});
userSchema.pre('save', function(next) {
    this.fullName = `${this.firstName} ${this.lastName}`;
    next();
});
userSchema.pre('findOneAndUpdate', function (next) {
    this._update.updatedAt = new Date();
    next();
});
userSchema.pre('validate', function(next) {
    if (this.age < 0) {
        this.age = 1;
    }
    next();
});

const User = mongoose.model('User', userSchema);

export default User;
