const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');

const activityModel = require('../models/activity_model');

const createActivity = async (req, res) => {
  const leaderId = req.user.userId;
  const { title, scheduleId, image, description, maxMembers } = req.body;

  await activityModel.createActivity(
    title,
    scheduleId,
    image,
    description,
    maxMembers,
    leaderId
  );

  res
    .status(StatusCodes.CREATED)
    .json({ msg: 'Success! Activity has been created.' });
};

const uploadActivityImage = async (req, res) => {
  const activityImage = req.files.image;

  const uploadResult = await activityModel.uploadActivityImage(activityImage);

  return res.status(StatusCodes.OK).json({ src: uploadResult });
};

const getAllActivities = async (req, res) => {
  const allActivities = await activityModel.getAllActivities();

  res.status(StatusCodes.OK).json(allActivities);
};

const getSingleActivity = async (req, res) => {
  const { id: activityId } = req.params;

  const activityInfo = await activityModel.getSingleActivity(activityId);

  if (!activityInfo) {
    throw new CustomError.NotFoundError(`No activity with ID: ${activityId}`);
  }

  res.status(StatusCodes.OK).json(activityInfo);
};

const getUserJoinedActivity = async (req, res) => {
  const userId = req.user.userId;

  const userActivities = await activityModel.getUserJoinedActivity(userId);

  res.status(StatusCodes.OK).json(userActivities);
};

const updateActivity = async (req, res) => {
  const { id: activityId } = req.params;
  const { title, image, description, maxMembers } = req.body;

  await activityModel.updateActivity(
    activityId,
    title,
    image,
    description,
    maxMembers
  );

  res
    .status(StatusCodes.OK)
    .json({ msg: 'Success! Activity has been updated.' });
};

const deleteActivity = async (req, res) => {
  const { id: activityId } = req.params;

  await activityModel.deleteActivity(activityId);

  res
    .status(StatusCodes.OK)
    .json({ msg: 'Success! Activity has been deleted.' });
};

const joinActivity = async (req, res) => {
  const { id: activityId } = req.params;
  const userId = req.user.userId;

  await activityModel.joinActivity(activityId, userId);

  res
    .status(StatusCodes.OK)
    .json({ msg: 'Success! You have joined the activity. Have fun!' });
};

const leaveActivity = async (req, res) => {
  const { id: activityId } = req.params;
  const userId = req.user.userId;

  await activityModel.leaveActivity(activityId, userId);

  res
    .status(StatusCodes.OK)
    .json({ msg: 'Success! You have left the activity.' });
};

const getActivityMembers = async (req, res) => {
  const { id: activityId } = req.params;

  const activityMembers = await activityModel.getActivityMembers(activityId);

  res.status(StatusCodes.OK).json(activityMembers);
};

const getChatLog = async (req, res) => {
  const { id: activityId } = req.params;

  const chatLogs = await activityModel.getChatLog(activityId);

  res.status(StatusCodes.OK).json(chatLogs);
};

const getCurrentMemberRole = async (req, res) => {
  const { id: activityId } = req.params;
  const userId = req.user.userId;

  const role = await activityModel.getCurrentMemberRole(activityId, userId);

  res.status(StatusCodes.OK).json(role);
};

module.exports = {
  createActivity,
  uploadActivityImage,
  joinActivity,
  leaveActivity,
  getAllActivities,
  getSingleActivity,
  getUserJoinedActivity,
  getActivityMembers,
  updateActivity,
  deleteActivity,
  getChatLog,
  getCurrentMemberRole,
};
