import * as core from "@actions/core";
import * as github from "@actions/github";
import { removeIgnoreTaskListText, createTaskListText } from "./utils";

async function run(): Promise<void> {
  try {
    const appName = "Task Completed Checker";
    const body = github.context.payload.pull_request?.body;

    core.getInput("repo-token", { required: true });

    if (!body) {
      core.info("No pull request body found.");
      return;
    }

    const cleanText = removeIgnoreTaskListText(body);
    core.debug("Pull request body after removing ignored sections:");
    core.debug(cleanText);

    const outputText = createTaskListText(cleanText);
    core.debug("Result: ");
    core.debug(outputText);

    const isTaskCompleted = cleanText.match(/(- \[[ ]\].+)/g) === null;

    const output = {
      title: appName,
      summary: isTaskCompleted
        ? "All tasks are completed!"
        : "Some tasks are not completed!",
      conclusion: isTaskCompleted ? "success" : "failure",
      status: "completed",
      text: outputText
    };

    core.setOutput("result", JSON.stringify(output));
    if (!isTaskCompleted) core.setFailed("Some tasks are not completed!");
  } catch (error) {
    core.setFailed(error instanceof Error ? error.message : String(error));
  }
}

run();
