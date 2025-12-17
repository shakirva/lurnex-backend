const axios = require('axios');

async function testJobCreation() {
  try {
    console.log('🧪 Testing job creation...');
    
    const newJob = {
      title: "React Developer",
      company: "Tech Solutions",
      location: "San Francisco",
      type: "Full-time",
      salary: "90000",
      description: "We need an experienced React developer to join our team",
      requirements: ["React", "JavaScript", "TypeScript", "Redux"],
      category_id: 1
    };
    
    console.log('📝 Creating job:', newJob);
    
    const response = await axios.post('http://localhost:5000/api/jobs', newJob, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Job created successfully!');
    console.log('📊 Response:', response.data);
    
  } catch (error) {
    console.error('❌ Error creating job:', error.response?.data || error.message);
  }
}

async function testGetJobs() {
  try {
    console.log('🔍 Testing get jobs...');
    
    const response = await axios.get('http://localhost:5000/api/jobs');
    
    console.log('✅ Jobs retrieved successfully!');
    console.log('📊 Total jobs:', response.data.data?.length || 0);
    
  } catch (error) {
    console.error('❌ Error getting jobs:', error.response?.data || error.message);
  }
}

async function runTests() {
  console.log('🚀 Starting API tests...');
  
  // Wait for server to be ready
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  await testGetJobs();
  await testJobCreation();
  await testGetJobs();
  
  console.log('🎉 Tests completed!');
}

runTests();