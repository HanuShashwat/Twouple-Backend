const User = require('../models/User');

/**
 * Fetches a user profile, stripping out unnecessary database metadata.
 */
exports.getUserById = async (userId) => {
  const user = await User.findByPk(userId, {
    attributes: { exclude: ['createdAt', 'updatedAt'] }
  });
  
  if (!user) throw new Error('User not found');
  return user;
};

/**
 * Updates a user's profile. (This is used for onboarding and settings).
 */
exports.updateUser = async (userId, updateData) => {
  const user = await User.findByPk(userId);
  if (!user) throw new Error('User not found');

  // [FUTURE PROOFING]: If updateData includes DOB, you would call the astrologyService 
  // here to automatically calculate and inject the new `zodiac_sign` before saving.
  
  await user.update(updateData);
  
  // Return fresh data without timestamps
  return await this.getUserById(userId); 
};

/**
 * Hard deletes a user account (Required for Apple App Store / Google Play compliance).
 */
exports.deleteUser = async (userId) => {
  const deletedRowCount = await User.destroy({ where: { id: userId } });
  if (deletedRowCount === 0) throw new Error('User not found or already deleted');
  return true;
};