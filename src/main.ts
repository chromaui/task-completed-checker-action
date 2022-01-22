import * as core from "@actions/core";
import * as github from "@actions/github";
import { removeIgnoreTaskListText, createTaskListText } from "./utils";

async function run(): Promise<void> {
  try {
    const body = github.context.payload.pull_request?.body;

    const token = core.getInput("repo-token", { required: true });
    const appName = "Task Completed Checker";

    if (!body) {
      core.info("no task list and skip the process.");
      return;
    }

    const result = removeIgnoreTaskListText(body);

    core.debug("creates a list of tasks which removed ignored task: ");
    core.debug(result);

    const isTaskCompleted = result.match(/(- \[[ ]\].+)/g) === null;

    const text = createTaskListText(result);

    core.debug("creates a list of completed tasks and uncompleted tasks: ");
    core.debug(text);

    const output = {
      title: appName,
      summary: isTaskCompleted
        ? "All tasks are completed!"
        : "Some tasks are not completed!",
      conclusion: isTaskCompleted ? "success" : "failure",
      status: "completed",
      text
    };

    core.setOutput("result", JSON.stringify(output));
    if (!isTaskCompleted) core.setFailed("Some tasks are not completed!");
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
