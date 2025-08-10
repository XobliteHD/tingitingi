import express from 'express';
import Article from '../models/Article.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const articles = await Article.find({ isPublished: true }).sort({ createdAt: -1 });
        res.status(200).json(articles);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching articles' });
    }
});

router.get('/:slug', async (req, res) => {
    try {
        const article = await Article.findOne({ slug: req.params.slug, isPublished: true });
        if (!article) {
            return res.status(404).json({ message: 'Article not found' });
        }
        res.status(200).json(article);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching article' });
    }
});

export default router;