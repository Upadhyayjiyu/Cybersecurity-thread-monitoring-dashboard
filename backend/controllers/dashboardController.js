const LoginLog = require('../models/LoginLog');
const Alert = require('../models/Alert');
const User = require('../models/User');

const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalLogins = await LoginLog.countDocuments();
    const failedLogins = await LoginLog.countDocuments({ success: false });
    const unresolvedAlerts = await Alert.countDocuments({ resolved: false });

    // Aggregate logins by date for a chart (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const loginTrends = await LoginLog.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      { 
        $group: {
          _id: { 
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          successCount: { $sum: { $cond: ["$success", 1, 0] } },
          failCount: { $sum: { $cond: ["$success", 0, 1] } }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    res.json({
      totalUsers,
      totalLogins,
      failedLogins,
      unresolvedAlerts,
      loginTrends
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getRecentLogs = async (req, res) => {
  try {
    const logs = await LoginLog.find().sort({ createdAt: -1 }).limit(50).populate('userId', 'username');
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find().sort({ createdAt: -1 }).limit(20);
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getDashboardStats, getRecentLogs, getAlerts };
