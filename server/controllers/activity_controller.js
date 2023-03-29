const pool = require('../db/connectDB');

const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const path = require('path');
const createActivity = async (req, res) => {
  const leaderId = req.user.userId;

  const { title, scheduleId, image, description, maxMembers } = req.body;

  const activityQuery = await pool.query(
    'INSERT INTO activity (title, schedule_id, image, description, max_member, create_time) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP) RETURNING id;',
    [title, scheduleId, image, description, maxMembers]
  );

  const { id: activityId } = activityQuery.rows[0];
  await pool.query(
    "INSERT INTO activity_member(activity_id, member_id, role) VALUES ($1, $2, 'leader')",
    [activityId, leaderId]
  );

  res
    .status(StatusCodes.CREATED)
    .json({ msg: 'Success! Activity has been created.' });
};

const uploadActivityImage = async (req, res) => {
  const activityImage = req.files.image;
  console.log(activityImage);
  const imagePath = path.join(
    __dirname,
    '../public/image/activity_image/' + `${activityImage.name}`
  );
  await activityImage.mv(imagePath);

  return res
    .status(StatusCodes.OK)
    .json({ src: `/image/activity_image/${activityImage.name}` });
};

const getAllActivities = async (req, res) => {
  const activityQuery = await pool.query(
    `SELECT activity.id, activity.title, activity.image, activity.description, activity.max_member, activity.create_time, 
            movie_schedule.id AS schedule_id, movie_schedule.date, movie_schedule.time,
            movie_info.title AS movie_title, movie_info.title_en, movie_info.runtime,
            theater.name AS theater_name, theater.address,
            city.name AS city
    FROM activity
    JOIN movie_schedule ON activity.schedule_id=movie_schedule.id
    JOIN movie_info ON movie_schedule.movie_id=movie_info.movie_id
    JOIN theater ON movie_schedule.theater_id=theater.id
    JOIN city ON theater.city_id=city.id;
    `
  );
  const allActivities = activityQuery.rows;
  // console.log(activityQuery);
  res.status(StatusCodes.OK).json(allActivities);
};

const getSingleActivity = async (req, res) => {
  const { id: activityId } = req.params;

  const activityQuery = await pool.query(
    `SELECT activity.id, activity.title, activity.image, activity.description, activity.max_member, activity.create_time, 
            movie_schedule.id AS schedule_id, movie_schedule.date, movie_schedule.time, 
            movie_info.title AS movie_title, movie_info.title_en, movie_info.runtime,
            theater.name AS theater_name, theater.address,
            city.name AS city
      FROM activity
      JOIN movie_schedule ON activity.schedule_id=movie_schedule.id
      JOIN movie_info ON movie_schedule.movie_id=movie_info.movie_id
      JOIN theater ON movie_schedule.theater_id=theater.id
      JOIN city ON theater.city_id=city.id
      WHERE activity.id=$1;`,
    [activityId]
  );
  const activityInfo = activityQuery.rows[0];
  // console.log(activityQuery);

  if (!activityInfo) {
    throw new CustomError.NotFoundError(`No activity with ID: ${activityId}`);
  }

  res.status(StatusCodes.OK).json(activityInfo);
};

const updateActivity = async (req, res) => {
  const { id: activityId } = req.params;
  const { title, image, description, maxMembers } = req.body;

  await pool.query(
    'UPDATE activity SET title=$1, image=$2, description=$3, max_member=$4 WHERE id=$5;',
    [title, image, description, maxMembers, activityId]
  );

  // const activityInfo = activityQuery.rows[0];
  res
    .status(StatusCodes.OK)
    .json({ msg: 'Success! Activity has been updated.' });
};

const deleteActivity = async (req, res) => {
  const { id: activityId } = req.params;

  await pool.query('DELETE FROM activity WHERE id=$1', [activityId]);
  res
    .status(StatusCodes.OK)
    .json({ msg: 'Success! Activity has been deleted.' });
};

const joinActivity = async (req, res) => {
  const { id: activityId } = req.params;
  const userId = req.user.userId;

  await pool.query(
    "INSERT INTO activity_member (activity_id, member_id, role) VALUES ($1, $2, 'member');",
    [activityId, userId]
  );

  res
    .status(StatusCodes.OK)
    .json({ msg: 'Success! You have joined the activity. Have fun!' });
};

const getActivityMembers = async (req, res) => {
  const { id: activityId } = req.params;
  const activityQuery = await pool.query(
    'SELECT activity_member.activity_id, activity_member.member_id, users.name, activity_member.role  FROM activity_member JOIN users ON activity_member.member_id=users.id WHERE activity_member.activity_id=$1',
    [activityId]
  );
  const activityMembers = activityQuery.rows;
  res.status(StatusCodes.OK).json(activityMembers);
};

module.exports = {
  createActivity,
  uploadActivityImage,
  joinActivity,
  getAllActivities,
  getSingleActivity,
  getActivityMembers,
  updateActivity,
  deleteActivity,
};
