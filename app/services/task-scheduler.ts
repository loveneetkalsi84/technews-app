import { fetchRssFeeds } from "./rss-service";
import { scrapeProductData } from "./scraping-service";
import { generateContent } from "./ai-content-service";
import connectToDatabase from "@/app/lib/mongodb";
import { ScheduledTask } from "@/app/models/schema";

/**
 * Run all scheduled tasks
 */
export async function runScheduledTasks() {
  try {
    console.log("Starting scheduled tasks runner...");
    await connectToDatabase();
    
    // Get all active tasks
    const tasks = await ScheduledTask.find({ isActive: true });
    
    console.log(`Found ${tasks.length} active scheduled tasks`);
    
    const now = new Date();
    let tasksRun = 0;
    
    for (const task of tasks) {
      try {
        // Check if the task should run now based on its last run time and frequency
        const shouldRun = shouldTaskRunNow(task, now);
        
        if (!shouldRun) {
          console.log(`Task "${task.name}" (${task.type}) is not due to run yet. Skipping.`);
          continue;
        }
        
        console.log(`Running task "${task.name}" (${task.type})...`);
        
        let result;
        
        // Run the appropriate task based on type
        switch(task.type) {
          case "rss":
            result = await fetchRssFeeds();
            break;
          case "scrape":
            result = await scrapeProductData();
            break;
          case "ai-generate":
            // For AI generation, get the parameters from the task configuration
            if (task.config && task.config.aiGenerationParams) {
              result = await generateContent(task.config.aiGenerationParams);
            } else {
              throw new Error("Missing AI generation parameters in task configuration");
            }
            break;
          default:
            throw new Error(`Unknown task type: ${task.type}`);
        }
        
        // Update the task with the latest run information
        await ScheduledTask.updateOne(
          { _id: task._id },
          {
            $set: {
              lastRun: now,
              lastRunStatus: result.success ? "success" : "failed",
              lastRunMessage: result.message,
            },
            $inc: { runCount: 1 }
          }
        );
        
        console.log(`Task "${task.name}" completed with status: ${result.success ? "success" : "failed"}`);
        tasksRun++;
        
      } catch (taskError) {
        console.error(`Error running task "${task.name}":`, taskError);
        
        // Update the task with the error information
        await ScheduledTask.updateOne(
          { _id: task._id },
          {
            $set: {
              lastRun: now,
              lastRunStatus: "failed",
              lastRunMessage: `Error: ${taskError}`,
            },
            $inc: { runCount: 1, errorCount: 1 }
          }
        );
      }
    }
    
    console.log(`Scheduled tasks runner completed. Ran ${tasksRun} tasks.`);
    return { success: true, message: `Ran ${tasksRun} scheduled tasks` };
    
  } catch (err) {
    console.error("Scheduled tasks runner failed:", err);
    return { success: false, message: `Scheduled tasks runner failed: ${err}` };
  }
}

/**
 * Determine if a task should run now based on its schedule
 */
function shouldTaskRunNow(task: any, now: Date): boolean {
  // If the task has never run, it should run now
  if (!task.lastRun) {
    return true;
  }
  
  const lastRun = new Date(task.lastRun);
  const frequency = task.frequency || "daily"; // Default to daily if not specified
  
  // Calculate the next run time based on frequency
  let nextRun = new Date(lastRun);
  
  switch (frequency) {
    case "hourly":
      nextRun.setHours(lastRun.getHours() + 1);
      break;
    case "daily":
      nextRun.setDate(lastRun.getDate() + 1);
      break;
    case "weekly":
      nextRun.setDate(lastRun.getDate() + 7);
      break;
    case "monthly":
      nextRun.setMonth(lastRun.getMonth() + 1);
      break;
    default:
      // For custom intervals in minutes
      const minutes = parseInt(frequency, 10);
      if (!isNaN(minutes)) {
        nextRun.setMinutes(lastRun.getMinutes() + minutes);
      } else {
        // Unknown frequency, default to daily
        nextRun.setDate(lastRun.getDate() + 1);
      }
  }
  
  // If now is after the next run time, the task should run
  return now >= nextRun;
}
