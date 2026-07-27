import { JobModel } from '../src/models/Job';
import database from '../src/config/database';

async function testCreateJob() {
  await database.connect();
  console.log('Testing job creation...');
  try {
    const jobData = {
      title: "Software Engineer",
      company: "Tech Corp",
      location: "Remote",
      type: "Full-time",
      salary: "$100k - $120k",
      description: "Great job",
      requirements: ["React", "Node.js"],
      category_id: 1,
      food_accommodation: "Not Provided",
      gender: "Any"
    } as any;
    const userId = 1; // admin
    const newJob = await JobModel.create(jobData, userId);
    console.log('Job created successfully:', newJob);
  } catch (error) {
    console.error('Failed to create job:', error);
  } finally {
    process.exit(0);
  }
}

testCreateJob();
