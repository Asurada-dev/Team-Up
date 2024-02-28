const activityModel = require('../models/activity_model');

const checkIsActivityMember = async (activityId, userId) => {
  const activityMember = await activityModel.getCurrentMemberRole(
    activityId,
    userId
  );

  if (activityMember) {
    return 'joined';
  }
  return 'info';
};

module.exports = checkIsActivityMember;
