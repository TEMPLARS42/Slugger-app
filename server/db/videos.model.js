const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
    title: { type: String },
    creator: { type: String },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'userInfo' },
    thumbnailUrl: { type: String },
    videoUrl: { type: String },
    bookmarkedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'userInfo' }],
    thumbnail: {
        fileId: { type: String },
        bucketId: { type: String }
    },
    video: {
        fileId: { type: String },
        bucketId: { type: String }
    }
});

module.exports = mongoose.model('video', videoSchema);
