const Chat = require('../models/Chat');
const File = require('../models/File');

const getChatMessages = async (req, res) => {
  try {
    const messages = await Chat.getMessages(
      parseInt(req.params.id),
      req.user.id_usuario
    );
    res.json(messages);
  } catch (error) {
    const statusCode = error.message.includes('No autorizado') ? 403 : 500;
    res.status(statusCode).json({ error: error.message });
  }
};

const sendChatMessage = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    const messageId = await Chat.sendMessage(
      parseInt(req.params.id),
      req.user.id_usuario,
      text.trim()
    );

    res.status(201).json({ 
      success: true,
      id: messageId 
    });
  } catch (error) {
    const statusCode = error.message.includes('No autorizado') ? 403 : 500;
    res.status(statusCode).json({ error: error.message });
  }
};

const uploadChatFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const uploadedFile = {
      originalname: req.file.originalname,
      buffer: req.file.buffer,
      mimetype: req.file.mimetype
    };

    const result = await File.uploadFile(
      parseInt(req.params.id),
      req.user.id_usuario,
      uploadedFile
    );

    res.status(201).json(result);
  } catch (error) {
    const statusCode = error.message.includes('No tienes permisos') ? 403 : 500;
    res.status(statusCode).json({ error: error.message });
  }
};

const getChatFiles = async (req, res) => {
  try {
    const files = await File.getFiles(
      parseInt(req.params.id),
      req.user.id_usuario
    );
    res.json(files);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { 
  getChatMessages,
  sendChatMessage,
  uploadChatFile,
  getChatFiles
};