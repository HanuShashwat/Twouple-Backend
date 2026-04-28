const Joi = require('joi');
const syncService = require('../services/syncService');

exports.invite = async (req, res) => {
  const schema = Joi.object({
    partner_phone: Joi.string().min(10).max(15).required()
  });

  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });

  try {
    const relationship = await syncService.invitePartner(req.user.id, value.partner_phone);
    return res.status(200).json({ success: true, message: 'Invitation sent successfully.', data: relationship });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

exports.getStatus = async (req, res) => {
  try {
    const statusInfo = await syncService.getRelationshipStatus(req.user.id);
    return res.status(200).json({ success: true, data: statusInfo });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve relationship status.' });
  }
};

exports.accept = async (req, res) => {
  try {
    const activeRelationship = await syncService.acceptInvitation(req.user.id);
    return res.status(200).json({ success: true, message: 'Relationship established!', data: activeRelationship });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};