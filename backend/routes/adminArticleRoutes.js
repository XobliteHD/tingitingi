import express from 'express';
import Article from '../models/Article.js';
import multer from 'multer';
import { storage as cloudinaryStorage, cloudinary } from '../config/cloudinaryConfig.js';

const router = express.Router();
const upload = multer({ storage: cloudinaryStorage });

router.get('/', async (req, res) => {
  try {
    const articles = await Article.find({}).sort({ createdAt: -1 });
    res.status(200).json(articles);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching articles' });
  }
});

router.get('/:id', async (req, res) => {
    try {
        const article = await Article.findById(req.params.id);
        if (!article) return res.status(404).json({ message: 'Article not found' });
        res.status(200).json(article);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching article' });
    }
});

router.post('/', upload.single('mainImage'), async (req, res) => {
    const { title, summary, content, slug, isPublished } = req.body;
    try {
        const newArticle = new Article({
            title,
            summary,
            content,
            slug,
            isPublished: isPublished === 'true',
            mainImage: req.file ? req.file.path : undefined,
        });
        const savedArticle = await newArticle.save();
        res.status(201).json(savedArticle);
    } catch (error) {
        if (error.code === 11000) { 
            return res.status(400).json({ message: 'Slug already exists. Please use a unique one.' });
        }
        res.status(500).json({ message: 'Server error creating article', error: error.message });
    }
});

router.put('/:id', upload.single('mainImage'), async (req, res) => {
    const { title, summary, content, slug, isPublished } = req.body;
    try {
        const article = await Article.findById(req.params.id);
        if (!article) return res.status(404).json({ message: 'Article not found' });

        article.title = title || article.title;
        article.summary = summary || article.summary;
        article.content = content || article.content;
        article.slug = slug || article.slug;
        article.isPublished = isPublished === 'true';

        if (req.file) {
            article.mainImage = req.file.path;
        }

        const updatedArticle = await article.save();
        res.status(200).json(updatedArticle);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Slug already exists. Please use a unique one.' });
        }
        res.status(500).json({ message: 'Server error updating article', error: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const article = await Article.findByIdAndDelete(req.params.id);
        if (!article) return res.status(404).json({ message: 'Article not found' });
        res.status(200).json({ message: 'Article deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error deleting article' });
    }
});

export default router;