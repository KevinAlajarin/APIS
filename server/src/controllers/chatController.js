// server/src/controllers/chatController.js
const Chat = require('../models/Chat');
const File = require('../models/File');

const getChat = async (req, res) => {
  try {
    if (!req.params.id_contratacion) {
      return res.status(400).json({ error: 'ID de contratación requerido' });
    }
    
    const messages = await Chat.getMessages(
      parseInt(req.params.id_contratacion),
      req.user.id_usuario
    );
    
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { texto } = req.body;
    if (!texto || texto.trim().length === 0) {
      return res.status(400).json({ error: 'El mensaje no puede estar vacío' });
    }

    const messageId = await Chat.sendMessage(
      parseInt(req.params.id_contratacion),
      req.user.id_usuario,
      texto.trim()
    );

    res.status(201).json({ 
      success: true,
      id_mensaje: messageId 
    });
  } catch (error) {
    const statusCode = error.message.includes('No autorizado') ? 403 : 500;
    res.status(statusCode).json({ error: error.message });
  }
};

const uploadFile = async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No se ha subido ningún archivo' });
      }
  
      // Obtener metadata del archivo
      const uploadedFile = {
        originalname: req.file.originalname,
        buffer: req.file.buffer,
        mimetype: req.file.mimetype
      };
  
      const result = await File.uploadFile(
        parseInt(req.params.id_contratacion),
        req.user.id_usuario,
        uploadedFile
      );
  
      res.status(201).json(result);
    } catch (error) {
      const statusCode = error.message.includes('No tienes permisos') ? 403 : 500;
      res.status(statusCode).json({ error: error.message });
    }
  };

const getFiles = async (req, res) => {
  try {
    const files = await File.getFiles(
      parseInt(req.params.id_contratacion),
      req.user.id_usuario
    );
    
    res.json(files);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getChat, sendMessage, uploadFile, getFiles };