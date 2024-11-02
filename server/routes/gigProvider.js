const express = require('express');
const mongoose = require('mongoose');
const Applicationdb = require('../models/ApplicationsCollectionsdb')
const JobCollection = require('../models/jobCollectionsdb');
const ProviderCollection = require('../models/providerCollectiondb');
const SeekerCollection = require('../models/seekerCollectionsdb')
const router = express.Router();

const Conversation = require('../models/Conversation');

router.post('/post', async (req, res) => {
  const {
    userId,
    position,
    duration,
    pay,
    date,
    vacancy,
    shift,
    description,
  } = req.body;

  console.log('Received request:', req.body);
  console.log('Position:', position);

  try {
    // Find provider to get location
    const provider = await ProviderCollection.findById(userId); // Directly use userId
    if (!provider) {
      return res.status(404).json({ error: 'Provider not found' });
    }

    const location = provider.location;

    // Generate a jobId
    const jobId = new mongoose.Types.ObjectId();

    // Create a new job document using the formData and provider location
    const newJob = new JobCollection({
      jobId: jobId.toString(),
      title: position,
      company: provider.company, // Assuming provider has a 'company' field
      shift,
      duration,
      pay,
      time: "Not specified", // Adjust if you have time
      role: position,
      vacancy,
      description,
      imageUrl: process.env.PROF_PIC, // Default image if not provided
      type: "Full-time", // Default type if not provided
      location,
      providerId: userId,
      lastdate: date, // Posting date
    });

    // Save the new job to the database
    await newJob.save();

    // Respond with success and job details
    res.status(201).json({ message: 'Job posted successfully', job: newJob });
  } catch (error) {
    console.error('Error posting job:', error);
    res.status(500).json({ error: 'Server error while posting job' });
  }
});



router.get('/yourgigs', async (req, res) => {
  const providerId = req.query.userId || req.params.userId; // Adjust based on how providerId is passed
  console.log(providerId);
  
  if (!providerId) {
    return res.status(400).json({ error: "Provider ID is required" });
  }

  try {
    // Find all jobs posted by the provider
    const jobs = await JobCollection.find({ providerId: providerId });
    console.log(jobs);
    
    // Map over each job to find corresponding applications and format the data
    const data = await Promise.all(
      jobs.map(async (job) => {
        // Find applications corresponding to each job
        const applications = await Applicationdb.find({ jobId: job.jobId });

        // Filter applications to include only those with status "pending"
        const pendingApplications = applications.filter(app => app.status === "pending");

        return {
          title: job.title,                          // Job title from JobCollection
          applicants: pendingApplications.length,     // Count of pending applications for this job
          // status: pendingApplications.map(app => app.status), // Status of each pending application
          jobId:job.jobId
        };
      })
    );

    // Filter out jobs with no pending applications
    // const filteredData = data.filter(item => item.applicants > 0);

    // console.log(filteredData); // Log the filtered data
    // Send response with formatted data
    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching gigs:", error);
    res.status(500).json({ error: "Failed to retrieve gigs" });
  }
});


router.get('/personalDetails', async (req, res) => {
  const { userId: providerId, jobId } = req.query; // Use req.query for query parameters
  
  if (!providerId || !jobId) {
    return res.status(400).json({ error: "Provider ID and Job ID are required" });
  }
  
  try {
    // Find applications with the specified providerId, jobId, and status "pending"
    const applications = await Applicationdb.find({ providerId, jobId, status: "pending" });

    // Map each application to fetch seeker details
    const data = await Promise.all(
      applications.map(async (application) => {
        const seeker = await SeekerCollection.findById(application.seekerId);
        
        return {
          name: seeker.name,
          email: seeker.email,
          phone: seeker.phone,
          address: seeker.address,
          city: seeker.city,
          jobId: application.jobId,
          seekerId: application.seekerId,
          providerId: application.providerId
        };
      })
    );

    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Failed to retrieve personal details" });
  }
});



router.post('/accepted', async (req, res) => {
  const { status, jobId, seekerId, providerId } = req.body;
  console.log({ status, jobId, seekerId, providerId });

  try {
    // Update application status
    const response = await Applicationdb.findOneAndUpdate(
      { seekerId: seekerId, jobId: jobId, providerId: providerId }, // Find criteria
      { status: status }, // Update fields
      { new: true } // Return the updated document
    );

    if (!response) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Create a new conversation directly when the status is approved
    if (status === 'approved') {
      const conversation = new Conversation({
        gigId: jobId,
        seekerId: seekerId,
        providerId: providerId,
      });

      await conversation.save(); // Save the new conversation

      // Include the conversation ID in the response
      return res.status(200).json({ 
        message: 'Application approved successfully, chat feature activated', 
        data: response, 
        conversationId: conversation._id // Return the conversation ID
      });
    }

    // If not approved, respond with the updated application status
    res.status(200).json({ 
      message: 'Application status updated successfully', 
      data: response 
    });

  } catch (error) {
    console.error('Error updating application:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


router.post('/rejected', async (req, res) => {
  const { status, jobId, seekerId, providerId } = req.body;
  
  try {
    const response = await Applicationdb.findOneAndUpdate(
      { seekerId: seekerId, jobId: jobId, providerId: providerId }, // Find criteria
      { status: status }, // Update fields
      { new: true } // Return the updated document
    );

    if (!response) {
      return res.status(404).json({ message: 'Application not found' });
    }

    res.status(200).json({ message: 'Application updated successfully', data: response });
  } catch (error) {
    console.error('Error updating application:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


router.get('/perfectedcandidates', async (req, res) => {
  const providerId = req.query.userId || req.params.userId; // Adjust based on how providerId is passed
  console.log(providerId);
  
  if (!providerId) {
    return res.status(400).json({ error: "Provider ID is required" });
  }

  try {
    // Find all jobs posted by the provider
    const jobs = await JobCollection.find({ providerId: providerId });
    console.log(jobs);
    
    // Map over each job to find corresponding applications and format the data
    const data = await Promise.all(
      jobs.map(async (job) => {
        // Find applications corresponding to each job
        const applications = await Applicationdb.find({ jobId: job.jobId });

        // Filter applications to include only those with status "pending"
        const pendingApplications = applications.filter(app => app.status === "approved");

        return {
          title: job.title,                          // Job title from JobCollection
          applicants: pendingApplications.length,     // Count of pending applications for this job
          // status: pendingApplications.map(app => app.status), // Status of each pending application
          jobId:job.jobId
        };
      })
    );

    // Filter out jobs with no pending applications
    // const filteredData = data.filter(item => item.applicants > 0);

    // console.log(filteredData); // Log the filtered data
    // Send response with formatted data
    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching gigs:", error);
    res.status(500).json({ error: "Failed to retrieve gigs" });
  }
});

router.get('/perfectCandidateDetails', async (req, res) => {
  const { userId: providerId, jobId } = req.query; // Use req.query for query parameters
  
  if (!providerId || !jobId) {
    return res.status(400).json({ error: "Provider ID and Job ID are required" });
  }
  
  try {
    // Find applications with the specified providerId, jobId, and status "pending"
    const applications = await Applicationdb.find({ providerId, jobId, status: "approved" });

    // Map each application to fetch seeker details
    const data = await Promise.all(
      applications.map(async (application) => {
        const seeker = await SeekerCollection.findById(application.seekerId);
        
        return {
          name: seeker.name,
          email: seeker.email,
          phone: seeker.phone,
          address: seeker.address,
          city: seeker.city,
          jobId: application.jobId,
          seekerId: application.seekerId,
          providerId: application.providerId
        };
      })
    );

    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Failed to retrieve personal details" });
  }
});

router.post('/done', async (req, res) => {
  const { status, jobId, seekerId, providerId } = req.body;
  console.log({ status, jobId, seekerId, providerId })
  try {
    const response = await Applicationdb.findOneAndUpdate(
      { seekerId: seekerId, jobId: jobId, providerId: providerId }, // Find criteria
      { status: status }, // Update fields
      { new: true } // Return the updated document
    );

    if (!response) {
      return res.status(404).json({ message: 'Application not found' });
    }

    res.status(200).json({ message: 'Application updated successfully', data: response });
  } catch (error) {
    console.error('Error updating application:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
