"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const videosService_1 = require("../services/videosService");
const videosRouter = express_1.default.Router();
videosRouter.get('/', (req, res) => {
    (0, videosService_1.getAllVideos)().then((videos) => res.send(videos));
});
videosRouter.get('/:id', (req, res) => {
    const videoId = Number(req.params.id);
    // Check if the video ID is a valid number
    if (isNaN(videoId)) {
        res.status(400).send('Invalid video ID. Must be a number.');
        return;
    }
    (0, videosService_1.getVideoById)(videoId).then((video) => {
        if (!video) {
            res.status(404).send("Video not found.");
        }
        else {
            res.send(video);
        }
    });
});
videosRouter.put('/:id', (req, res) => {
    try {
        const videoId = Number(req.params.id);
        // Check if the video ID is a valid number
        if (isNaN(videoId)) {
            res.status(400).send('Invalid video ID. Must be a number.');
            return;
        }
        const { title, duration } = req.body;
        // Validate the presence of required fields
        if (!title && !duration) {
            return res.status(400).json({ error: 'Title or duration are required' });
        }
        // Update the video in the database
        (0, videosService_1.updateVideo)(videoId, title, duration).then((updatedVideo) => res.status(200).json(updatedVideo));
    }
    catch (error) {
        console.error('Error updating video:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
videosRouter.post('/', (req, res) => {
    try {
        if (req.body == null) {
            return res.status(400).json({ error: 'Title and duration are required' });
        }
        const { title, duration } = req.body;
        // Validate the presence of required fields
        if (!title || !duration) {
            return res.status(400).json({ error: 'Title and duration are required' });
        }
        // Create the video in the database
        (0, videosService_1.createVideo)(title, duration).then((createdVideo) => res.status(201).json(createdVideo));
    }
    catch (error) {
        console.error('Error creating video:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
exports.default = videosRouter;
