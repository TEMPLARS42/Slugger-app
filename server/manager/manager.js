const UserModel = require('../db/user.model');
const JWT_SECRET = process.env.JWT_SECRET
const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt");
const VideosModel = require('../db/videos.model');
const fs = require('fs');
const { createFile, fetchStreamableUrl } = require('../services/appwrite.service');

const userSignUp = async (req, res) => {
    if (!req.body.password || !req.body.email) return res.status(400).send({});
    if (req.body.password)
        req.body.password = await hashPassword(req.body.password);

    const userInfo = await UserModel(req.body).save();

    // getting jwt token...............
    const token = jwt.sign({ userId: userInfo._id }, JWT_SECRET, { expiresIn: '2h' });
    res.send({ token, userInfo });
}

const userLogin = async (req, res) => {
    const { email, password } = req.body;
    if (email && password) {
        const userInfo = await UserModel.findOne({ email }).lean();

        let ispasswordCorrect = await comparePassword(password, userInfo.password);
        if (ispasswordCorrect) {
            const token = jwt.sign({ userId: userInfo._id }, JWT_SECRET, { expiresIn: '2h' });
            return res.status(200).send({ token: token, userInfo });
        }
        else
            return res.status(500).send({ message: 'Incorrect password !!' })
    }
    else {
        return res.status(400).send({ message: 'Give proper ceredntials !!' })
    }
}

const userLogout = async (req, res) => {
    const { userId } = req.body;
    if (userId) {
        const userInfo = await UserModel.findOne({ _id: userId }).lean();
        if (userInfo) {
            console.log("Presseeed", userId)
            return res.status(200).send();
        }
        else
            return res.status(500).send({ message: 'User not exists' })
    }
    else {
        return res.status(400).send({ message: 'UserId is missing' })
    }
}

const hashPassword = async (userPassword) => {
    try {
        // Generate a salt
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(userPassword, salt);

        return hash;
    } catch (error) {
        console.error('Error hashing password:', error);
        throw error;
    }
}

const comparePassword = async (plaintextPassword, hashedPasswordFromDatabase) => {
    try {
        // Compare the plaintext password with the hashed password from the database
        const result = await bcrypt.compare(plaintextPassword, hashedPasswordFromDatabase);

        if (result) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.error('Error comparing passwords:', error);
        throw error;
    }
}

const getUserInfo = async (req, res) => {
    try {
        const authorizationHeader = req.headers['authorization'];

        if (authorizationHeader) {
            const token = authorizationHeader.split(' ')[1];
            let decoded = null;

            try { decoded = jwt.verify(token, JWT_SECRET); }
            catch (error) {
                return res.status(401).send({ message: "TERMINATE" });
            }
            const userId = decoded.userId;

            const userInfo = await UserModel.findOne({ _id: userId }).lean();
            return res.status(200).send({ userInfo: userInfo });
        }
    }
    catch (err) {
        console.log(err)
    }
}

const getUserVideos = async (req, res) => {
    try {
        const videos = await VideosModel.find({ userId: req.query.userId }).lean();

        for (let el of videos) {
            if (el.thumbnail) {
                el.thumbnailUrl = fetchStreamableUrl(el.thumbnail.bucketId, el.thumbnail.fileId)
                el.videoUrl = fetchStreamableUrl(el.video.bucketId, el.video.fileId)
            }
        }
        return res.status(200).send({ posts: videos });
    }
    catch (err) {
        console.log(err)
    }
}

const getTrendingVideos = async (req, res) => {
    try {
        const { limit = 10, offset = 0 } = req.query;

        const totalVideos = await VideosModel.countDocuments({});

        const videos = await VideosModel.find({})
            .lean()
            .skip(Number(offset))
            .limit(Number(limit));


        for (let el of videos) {
            if (el.thumbnail) {
                el.thumbnailUrl = fetchStreamableUrl(el.thumbnail.bucketId, el.thumbnail.fileId)
                el.videoUrl = fetchStreamableUrl(el.video.bucketId, el.video.fileId)
            }
        }

        return res.status(200).send({ posts: videos, total: totalVideos });
    }
    catch (err) {
        console.log(err)
    }
}

const fetchSearchVideos = async (req, res) => {
    try {
        const videos = await VideosModel.find({ title: { $regex: req.query.searchQuery, $options: 'i' }, userId: req.query.userId }).lean();

        for (let el of videos) {
            if (el.thumbnail) {
                el.thumbnailUrl = fetchStreamableUrl(el.thumbnail.bucketId, el.thumbnail.fileId)
                el.videoUrl = fetchStreamableUrl(el.video.bucketId, el.video.fileId)
            }
        }

        return res.status(200).send({ posts: videos });
    }
    catch (err) {
        console.log(err)
    }
}

const uploadPost = async (req, res) => {
    try {
        const { files, body } = req;
        const parsedData = JSON.parse(body.data)

        let videoObject = {
            ...parsedData,
        }

        // upload files in appwrite................
        for (let file of files) {
            const filePath = file.path;
            const fileName = file.originalname;

            const uploadResponse = await createFile(filePath, fileName)

            if (uploadResponse.mimeType == "video/mp4") {
                videoObject.video = {
                    bucketId: uploadResponse.bucketId,
                    fileId: uploadResponse.$id
                }
            }
            else {
                videoObject.thumbnail = {
                    bucketId: uploadResponse.bucketId,
                    fileId: uploadResponse.$id
                }
            }
        }

        await VideosModel.create(videoObject);

        res.status(200).send({ message: "Files Uploaded succesfully" });
    }
    catch (err) {
        console.log(err)
    }
}

const addBookmark = async (req, res) => {
    try {
        const { videoId, userId } = req.body;
        await VideosModel.updateOne({ _id: videoId }, { $push: { bookmarkedBy: userId } });
        res.status(200).send({ message: "Added Bookmark succesfully" });
    }
    catch (err) {
        console.log(err)
    }
}

// {
//     '$id': 'VID-20240614-WA0000.mp4',
//     bucketId: '6640dfe70035f7d0ab84',
//     '$createdAt': '2024-08-10T08:13:54.793+00:00',
//     '$updatedAt': '2024-08-10T08:13:58.951+00:00',
//     '$permissions': [],
//     name: 'VID-20240614-WA0000.mp4',
//     signature: '34420d58fac9e41e630def66391fa166-2',
//     mimeType: 'video/mp4',
//     sizeOriginal: 5687848,
//     chunksTotal: 2,
//     chunksUploaded: 2
//   } 

module.exports = {
    userSignUp,
    userLogin,
    getUserInfo,
    getUserVideos,
    fetchSearchVideos,
    userLogout,
    uploadPost,
    getTrendingVideos,
    addBookmark
}