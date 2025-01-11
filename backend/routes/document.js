const express = require('express');
const Document = require('../models/Document');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Middleware to check if the user is authenticated
const authenticate = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).send('Access denied');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).send('Invalid token');
  }
};

// Fetch all documents for the authenticated user
router.get('/', authenticate, async (req, res) => {
  try {
    const documents = await Document.find({ user: req.user.id });  // Fetch documents for the logged-in user
    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching documents', error });
  }
});

// Fetch a specific document by ID for the authenticated user
router.get('/:id', authenticate, async (req, res) => {
  try {
    const document = await Document.findOne({ _id: req.params.id, user: req.user.id });  // Fetch document by ID for the logged-in user
    if (!document) {
      return res.status(404).json({ message: 'Document not found or you are not authorized to view it' });
    }
    res.json(document);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching document', error });
  }
});

// Create a new document for the authenticated user
router.post('/', authenticate, async (req, res) => {
  const { title, description, imageUrl } = req.body;

  // Validate required fields
  if (!title || title.trim() === '') {
    return res.status(400).json({ message: 'Title is required and cannot be empty' });
  }
  if (!description || description.trim() === '') {
    return res.status(400).json({ message: 'Description is required and cannot be empty' });
  }

  try {
    const newDocument = new Document({
      title,
      description,
      imageUrl: imageUrl || 'default-image-url', // Set a default image URL if none provided
      user: req.user.id,  // Associate the document with the authenticated user
    });
    await newDocument.save();
    res.status(201).json(newDocument);
  } catch (error) {
    res.status(500).json({ message: 'Error creating document', error });
  }
});

// Update a document for the authenticated user
router.put('/:id', authenticate, async (req, res) => {
  const { title, description, imageUrl } = req.body;

  // Validate required fields
  if (!title || title.trim() === '') {
    return res.status(400).json({ message: 'Title is required and cannot be empty' });
  }
  if (!description || description.trim() === '') {
    return res.status(400).json({ message: 'Description is required and cannot be empty' });
  }

  try {
    const document = await Document.findOne({ _id: req.params.id, user: req.user.id });
    if (!document) {
      return res.status(404).json({ message: 'Document not found or you are not authorized to edit it' });
    }

    document.title = title;
    document.description = description;
    document.imageUrl = imageUrl || document.imageUrl;  // Keep the old image URL if no new one is provided
    await document.save();
    res.json(document);
  } catch (error) {
    res.status(500).json({ message: 'Error updating document', error });
  }
});

// Delete a document for the authenticated user
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const document = await Document.findOne({ _id: req.params.id, user: req.user.id });
    console.log("Found document:", document);
    if (!document) {
      return res.status(404).json({ message: 'Document not found or you are not authorized to delete it' });
    }

    await document.deleteOne();
    res.status(200).json({ message: 'Document deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting document', error });
  }
});

module.exports = router;
