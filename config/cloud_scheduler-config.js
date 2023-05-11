import { CloudSchedulerClient } from "@google-cloud/scheduler";
import dotevn from "dotenv";
dotevn.config();
//create a client
const client = new CloudSchedulerClient();

async function checkIfJobExists(jobName, projectId, locationId) {
  const jobPath = `projects/${projectId}/locations/${locationId}/jobs/${jobName}`;
  try {
    const [job] = await schedulerClient.getJob({ name: jobPath });
    console.log(`Job ${jobName} exists!`);
    return true;
  } catch (e) {
    console.log(`Job ${jobName} does not exist.`);
    return false;
  }
}
export const createJob = async (
  jobName,
  endPoint,
  schedule,
  description = null
) => {
  try {
    const projectId = process.env.PROJECT_ID;
    const locationId = process.env.LOCATION_ID;
    const timezone = process.env.TIMEZONE;
    const job = {
      name: jobName,
      description,
      schedule,
      timezone,
      httpTarget: {
        uri: endPoint,
        httpMethod: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      },
    };
    //Check if a job already exists before creating one
    const jobExist = await checkIfJobExists(jobName, projectId, locationId);
    if (!jobExist) {
      await client.createJob({
        parent: `projects/${projectId}/locations/${locationId}`,
        job,
      });
      console.log(`Job ${jobName} created successfully.`);
    }
  } catch (e) {
    console.log("createJobEr: " + e);
  }
};

export const deleteJob = async (jobName) => {
  try {
    await client.deleteJob({ name: jobName });
    console.log(`Job ${jobName} deleted successfully.`);
  } catch (e) {
    console.log("deleteJobEr: " + e);
  }
};
