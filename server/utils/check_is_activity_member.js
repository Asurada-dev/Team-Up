const pool = require('../db/connectDB');

const checkIsActivityMember = async (activityId, userId) => {
  const activtyQuery = await pool.query(
    'SELECT * FROM activity_member WHERE activity_id=$1 AND member_id=$2;',
    [activityId, userId]
  );
  if (activtyQuery.rows[0]) {
    return 'joined';
  }
  return 'info';
};

module.exports = checkIsActivityMember;
