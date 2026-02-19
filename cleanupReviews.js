const mongoose = require('mongoose');
const Review = require('./models/review');

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log('MongoDB connection error:', err));

const deleteOrphanReviews = async () => {
    const result = await Review.deleteMany({ author: { $exists: false } });
    console.log('Deleted reviews:', result.deletedCount);
    mongoose.connection.close();
};

deleteOrphanReviews();