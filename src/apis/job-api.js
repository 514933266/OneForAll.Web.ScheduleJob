var API = {
  KEY: 'OneForAll.ScheduleJob',
  TASK: {
    URL: '/api/JobTasks',
    BATCH_DELETE: '/api/JobTasks/Batch/IsDeleted',
    ENABLED: '/api/JobTasks/{id}/IsEnabled'
  },
  TASK_LOG: {
    URL: '/api/JobTaskLogs'
  }
}

export default API
