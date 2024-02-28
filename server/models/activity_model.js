const pool = require('../db/connectDB');
const crypto = require('crypto');
const AWS = require('aws-sdk');

AWS.config.update({
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_ACCESS_KEY_SECRET,
  region: process.env.AWS_REGION,
});
const s3 = new AWS.S3();

const createActivity = async (
  title,
  scheduleId,
  image,
  description,
  maxMembers,
  leaderId
) => {
  const activityQuery = await pool.query(
    'INSERT INTO activity (title, schedule_id, img, description, max_member, create_time) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP) RETURNING id;',
    [title, scheduleId, image, description, maxMembers]
  );

  const { id: activityId } = activityQuery.rows[0];

  await pool.query(
    "INSERT INTO activity_member(activity_id, member_id, role) VALUES ($1, $2, 'leader');",
    [activityId, leaderId]
  );

  return activityId;
};

const uploadActivityImage = async (activityImage) => {
  const randomImageName = crypto.randomBytes(16).toString('hex');
  const uploadParams = {
    Bucket: 'team-up-bucket',
    Key: `image/activity/${randomImageName}`,
    Body: activityImage.data,
  };

  const uploadResult = await s3.upload(uploadParams).promise();

  return uploadResult.Location;
};

const getAllActivities = async () => {
  const activityQuery = await pool.query(
    `SELECT activity.id, activity.title, activity.img, activity.description, activity.max_member, activity.create_time,
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

  return activityQuery.rows;
};

const getSingleActivity = async (activityId) => {
  const activityQuery = await pool.query(
    `SELECT activity.id, activity.title, activity.img, activity.description, activity.max_member, activity.create_time, 
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

  return activityQuery.rows[0];
};

const getUserJoinedActivity = async (userId) => {
  const activityQuery = await pool.query(
    `
  SELECT activity.id, activity.title, activity.img, activity.description, activity.create_time,
         movie_schedule.id AS schedule_id, movie_schedule.date, movie_schedule.time, 
         movie_info.title AS movie_title, movie_info.title_en, movie_info.runtime,
         theater.name AS theater_name, theater.address,
         city.name AS city
  FROM activity
  JOIN activity_member ON activity.id=activity_member.activity_id
  JOIN movie_schedule ON activity.schedule_id=movie_schedule.id
  JOIN movie_info ON movie_schedule.movie_id=movie_info.movie_id
  JOIN theater ON movie_schedule.theater_id=theater.id
  JOIN city ON theater.city_id=city.id
  WHERE activity_member.member_id=$1;`,
    [userId]
  );

  return activityQuery.rows;
};

const updateActivity = async (
  activityId,
  title,
  image,
  description,
  maxMembers
) => {
  await pool.query(
    'UPDATE activity SET title=$1, img=$2, description=$3, max_member=$4 WHERE id=$5;',
    [title, image, description, maxMembers, activityId]
  );
};

const deleteActivity = async (activityId) => {
  await pool.query('DELETE FROM activity WHERE id=$1;', [activityId]);
};

const joinActivity = async (activityId, userId) => {
  await pool.query(
    "INSERT INTO activity_member (activity_id, member_id, role) VALUES ($1, $2, 'member');",
    [activityId, userId]
  );
};

const leaveActivity = async (activityId, userId) => {
  await pool.query(
    'DELETE FROM activity_member WHERE activity_id=$1 AND member_id=$2;',
    [activityId, userId]
  );
};

const getActivityMembers = async (activityId) => {
  const activityQuery = await pool.query(
    'SELECT activity_member.activity_id, activity_member.member_id, users.name, activity_member.role  FROM activity_member JOIN users ON activity_member.member_id=users.id WHERE activity_member.activity_id=$1;',
    [activityId]
  );

  return activityQuery.rows;
};

const getChatLog = async (activityId) => {
  const activityQuery = await pool.query(
    "SELECT users.name, cm.message, to_char(cm.send_time, 'YYYY-MM-DD HH24:MI') AS send_time FROM chatroom_message AS cm JOIN users ON cm.member_id=users.id WHERE cm.activity_id=$1 ORDER BY cm.send_time;",
    [activityId]
  );

  return activityQuery.rows;
};

const getCurrentMemberRole = async (activityId, userId) => {
  const activtyQuery = await pool.query(
    'SELECT role FROM activity_member WHERE activity_id=$1 AND member_id=$2;',
    [activityId, userId]
  );

  return activtyQuery.rows[0];
};

const sendMessage = async (activityId, userId, message) => {
  await pool.query(
    'INSERT INTO chatroom_message(activity_id, member_id, message, send_time) VALUES ($1, $2, $3, CURRENT_TIMESTAMP);',
    [activityId, userId, message]
  );
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
  sendMessage,
};
