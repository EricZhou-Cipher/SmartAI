import { rest } from "msw";

// 模拟通知数据
const mockNotifications = [
  {
    _id: "1",
    title: "系统通知",
    message: "系统将于今晚10点进行维护",
    type: "system",
    read: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(), // 1小时前
  },
  {
    _id: "2",
    title: "交易警报",
    message: "检测到异常交易活动",
    type: "transaction",
    read: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1天前
  },
  {
    _id: "3",
    title: "安全警报",
    message: "发现潜在安全风险",
    type: "alert",
    read: false,
    createdAt: new Date(Date.now() - 172800000).toISOString(), // 2天前
  },
];

// 模拟警报数据
const mockAlerts = [
  {
    _id: "1",
    name: "大额交易监控",
    object: "交易",
    condition: "金额 > 10000",
    riskLevel: "high",
    channels: ["邮件", "短信"],
    status: "active",
    createdAt: new Date().toISOString(),
  },
  {
    _id: "2",
    name: "异常登录监控",
    object: "用户",
    condition: "非常用IP登录",
    riskLevel: "medium",
    channels: ["邮件"],
    status: "active",
    createdAt: new Date().toISOString(),
  },
  {
    _id: "3",
    name: "系统负载监控",
    object: "系统",
    condition: "CPU使用率 > 90%",
    riskLevel: "low",
    channels: ["系统通知"],
    status: "inactive",
    createdAt: new Date().toISOString(),
  },
];

// 模拟警报统计数据
const mockAlertStats = {
  high: 5,
  medium: 12,
  low: 8,
};

// 模拟最近触发的警报
const mockRecentAlerts = [
  {
    _id: "1",
    ruleName: "大额交易监控",
    object: "交易#12345",
    riskLevel: "high",
    status: "unprocessed",
    timestamp: new Date(Date.now() - 1800000).toISOString(), // 30分钟前
  },
  {
    _id: "2",
    ruleName: "异常登录监控",
    object: "用户user123",
    riskLevel: "medium",
    status: "processed",
    timestamp: new Date(Date.now() - 7200000).toISOString(), // 2小时前
  },
  {
    _id: "3",
    ruleName: "系统负载监控",
    object: "服务器server1",
    riskLevel: "low",
    status: "unprocessed",
    timestamp: new Date(Date.now() - 14400000).toISOString(), // 4小时前
  },
];

// 模拟日志数据
const mockLogs = [
  {
    _id: "1",
    level: "info",
    message: "用户登录",
    source: "auth",
    details: { userId: "123", ip: "127.0.0.1" },
    timestamp: new Date().toISOString(),
  },
  {
    _id: "2",
    level: "error",
    message: "数据库连接失败",
    source: "database",
    details: { error: "Connection refused" },
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
];

// API 请求处理程序
export const handlers = [
  // 通知 API
  rest.get("http://localhost:5001/api/notifications", (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: mockNotifications,
        pagination: {
          total: mockNotifications.length,
          page: 1,
          limit: 10,
        },
      })
    );
  }),

  rest.get(
    "http://localhost:5001/api/notifications/unread/count",
    (req, res, ctx) => {
      const unreadCount = mockNotifications.filter((n) => !n.read).length;
      return res(
        ctx.status(200),
        ctx.json({
          success: true,
          data: { count: unreadCount },
        })
      );
    }
  ),

  rest.get("http://localhost:5001/api/notifications/:id", (req, res, ctx) => {
    const { id } = req.params;
    const notification = mockNotifications.find((n) => n._id === id);

    if (!notification) {
      return res(ctx.status(404));
    }

    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: notification,
      })
    );
  }),

  rest.patch(
    "http://localhost:5001/api/notifications/:id/read",
    (req, res, ctx) => {
      const { id } = req.params;
      const notification = mockNotifications.find((n) => n._id === id);

      if (!notification) {
        return res(ctx.status(404));
      }

      notification.read = true;

      return res(
        ctx.status(200),
        ctx.json({
          success: true,
          data: notification,
        })
      );
    }
  ),

  rest.patch(
    "http://localhost:5001/api/notifications/read-all",
    (req, res, ctx) => {
      mockNotifications.forEach((n) => {
        n.read = true;
      });

      return res(
        ctx.status(200),
        ctx.json({
          success: true,
          data: { message: "所有通知已标记为已读" },
        })
      );
    }
  ),

  rest.delete(
    "http://localhost:5001/api/notifications/:id",
    (req, res, ctx) => {
      const { id } = req.params;
      const index = mockNotifications.findIndex((n) => n._id === id);

      if (index === -1) {
        return res(ctx.status(404));
      }

      mockNotifications.splice(index, 1);

      return res(
        ctx.status(200),
        ctx.json({
          success: true,
          data: { message: "通知已删除" },
        })
      );
    }
  ),

  // 警报 API
  rest.get("http://localhost:5001/api/alerts/rules", (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: mockAlerts,
        pagination: {
          total: mockAlerts.length,
          page: 1,
          limit: 10,
        },
      })
    );
  }),

  rest.get("http://localhost:5001/api/alerts/stats", (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: mockAlertStats,
      })
    );
  }),

  rest.get("http://localhost:5001/api/alerts/recent", (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: mockRecentAlerts,
        pagination: {
          total: mockRecentAlerts.length,
          page: 1,
          limit: 10,
          totalPages: 10,
        },
      })
    );
  }),

  rest.post("http://localhost:5001/api/alerts/rules", (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
        success: true,
        data: { message: "警报规则创建成功" },
      })
    );
  }),

  rest.patch("http://localhost:5001/api/alerts/rules/:id", (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: { message: "警报规则更新成功" },
      })
    );
  }),

  rest.patch(
    "http://localhost:5001/api/alerts/recent/:id/process",
    (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({
          success: true,
          data: { message: "警报已标记为已处理" },
        })
      );
    }
  ),

  // 日志 API
  rest.get("http://localhost:5001/api/logs", (req, res, ctx) => {
    const level = req.url.searchParams.get("level");

    let filteredLogs = mockLogs;
    if (level) {
      filteredLogs = mockLogs.filter((log) => log.level === level);
    }

    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: {
          items: filteredLogs,
          total: filteredLogs.length,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      })
    );
  }),

  rest.get("http://localhost:5001/api/logs/stats", (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: {
          total: mockLogs.length,
          byLevel: {
            info: mockLogs.filter((log) => log.level === "info").length,
            warning: mockLogs.filter((log) => log.level === "warning").length,
            error: mockLogs.filter((log) => log.level === "error").length,
          },
          bySource: {
            auth: mockLogs.filter((log) => log.source === "auth").length,
            database: mockLogs.filter((log) => log.source === "database")
              .length,
          },
          byTime: [
            {
              date: new Date().toISOString().split("T")[0],
              count: mockLogs.length,
            },
          ],
        },
      })
    );
  }),

  rest.get("http://localhost:5001/api/logs/:id", (req, res, ctx) => {
    const { id } = req.params;
    const log = mockLogs.find((log) => log._id === id);

    if (!log) {
      return res(ctx.status(404));
    }

    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: log,
      })
    );
  }),

  // 认证 API
  rest.post("http://localhost:5001/api/auth/login", async (req, res, ctx) => {
    const body = await req.json();

    if (body.email === "test@example.com" && body.password === "password123") {
      return res(
        ctx.status(200),
        ctx.json({
          success: true,
          data: {
            token: "mock-jwt-token",
            user: {
              _id: "user123",
              email: "test@example.com",
              name: "Test User",
            },
          },
        })
      );
    }

    return res(
      ctx.status(401),
      ctx.json({
        success: false,
        error: "邮箱或密码不正确",
      })
    );
  }),
];
