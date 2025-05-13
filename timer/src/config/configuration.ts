export default () => ({
  port: parseInt(process.env.PORT || "3001", 10),
  backend: {
    url: process.env.BACKEND_URL || "http://localhost:3000",
  },
  executor: {
    url: process.env.EXECUTOR_URL || "http://localhost:8000",
  },
  timer: {
    intervalMinutes: parseInt(
      process.env.EXECUTION_INTERVAL_MINUTES || "5",
      10
    ),
  },
});
