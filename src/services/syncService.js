const { Op } = require('sequelize');
const Relationship = require('../models/Relationship');
const User = require('../models/User');

exports.invitePartner = async (currentUserId, partnerPhoneNumber) => {
  // 1. Check if user is trying to invite themselves
  const currentUser = await User.findByPk(currentUserId);
  if (currentUser.phone_number === partnerPhoneNumber) {
    throw new Error('You cannot invite yourself.');
  }

  // 2. Check if the partner exists in the database
  const partner = await User.findOne({ where: { phone_number: partnerPhoneNumber } });
  if (!partner) {
    throw new Error('Partner not found. Ask them to download Twouple and register first.');
  }

  // 3. Check if either user is ALREADY in an active or pending relationship
  const existingRelationship = await Relationship.findOne({
    where: {
      [Op.or]: [
        { user_one_id: currentUserId, status: ['active', 'pending'] },
        { user_two_id: currentUserId, status: ['active', 'pending'] },
        { user_one_id: partner.id, status: ['active', 'pending'] },
        { user_two_id: partner.id, status: ['active', 'pending'] }
      ]
    }
  });

  if (existingRelationship) {
    throw new Error('One of the users is already in a pending or active relationship.');
  }

  // 4. Create the pending relationship
  const newRelationship = await Relationship.create({
    user_one_id: currentUserId,
    user_two_id: partner.id,
    status: 'pending'
  });

  return newRelationship;
};

exports.getRelationshipStatus = async (userId) => {
  // Find any relationship where this user is either partner one or partner two
  const relationship = await Relationship.findOne({
    where: {
      [Op.or]: [{ user_one_id: userId }, { user_two_id: userId }]
    },
    include: [
      { model: User, as: 'PartnerOne', attributes: ['id', 'full_name', 'phone_number'] },
      { model: User, as: 'PartnerTwo', attributes: ['id', 'full_name', 'phone_number'] }
    ]
  });

  if (!relationship) return { status: 'none', data: null };

  return { status: relationship.status, data: relationship };
};

exports.acceptInvitation = async (userId) => {
  // Find a pending relationship where the current user is user_two (the receiver)
  const relationship = await Relationship.findOne({
    where: { user_two_id: userId, status: 'pending' }
  });

  if (!relationship) throw new Error('No pending invitation found.');

  relationship.status = 'active';
  relationship.established_at = new Date();
  
  // [FUTURE PROOFING]: Here is where we will trigger astrologyService to calculate 
  // their composite_score (Compatibility) based on both users' birth charts.
  
  await relationship.save();
  return relationship;
};