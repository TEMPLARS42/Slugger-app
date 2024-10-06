const express = require('express');
const { userSignUp, userLogin, getUserInfo, getVideos, fetchSearchVideos, userLogout, uploadPost, getUserVideos, getTrendingVideos, addBookmark } = require('../manager/manager');
const multer = require('multer');

const upload = multer({ dest: 'uploads/' });

const router = express.Router();

router.post('/signup', (req, res) => {
    userSignUp(req, res);
});

router.post('/login', (req, res) => {
    userLogin(req, res);
});

router.post('/logout', (req, res) => {
    userLogout(req, res);
});

router.get('/verify', (req, res) => {
    getUserInfo(req, res);
});

router.get('/user-videos', (req, res) => {
    getUserVideos(req, res);
});

router.get('/trending-videos', (req, res) => {
    getTrendingVideos(req, res);
});

router.get('/search-videos', (req, res) => {
    fetchSearchVideos(req, res);
});

router.post('/upload-post', upload.array('file'), (req, res) => {
    uploadPost(req, res);
});

router.post('/add-bookmark', (req, res) => {
    addBookmark(req, res);
});

module.exports = router;
