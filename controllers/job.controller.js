import Application from "../model/application.model.js";
import Job from "../model/job.model.js";
import User from "../model/user.model.js";

export const PostJob = async (req, res) => {
  const {
    role,
    company,
    location,
    employment_type,
    description,
    requirements,
    salary,
    application_deadline,
    language,
  } = req.body;

  console.log(req.body);

  // Check if req.user and userId exist to prevent errors
  if (!req.user || !req.user.userId) {
    return res.status(401).json({ error: "Unauthorized access" });
  }
  const { userId } = req.user;

  // Validate required fields (example)
  if (!role || !company || !location) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // Parse requirements safely
    let parsedRequirements = [];
    if (requirements) {
      try {
        parsedRequirements = JSON.parse(requirements);
      } catch (parseError) {
        return res.status(400).json({ error: "Invalid requirements format" });
      }
    }

    const newJob = new Job({
      employer: userId,
      role,
      company,
      location,
      employment_type,
      description,
      requirements: parsedRequirements,
      salary,
      application_deadline,
      language,
    });

    await newJob.save();
    res.status(200).json({ message: "Job posted", newJob });
  } catch (error) {
    console.log("Error in post controller ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const DeleteJobPost = async (req, res) => {
  const { id: jobId } = req.params;
  const { userId } = req.user;
  try {
    const job = await Job.findById(jobId);
    if (!job) return res.status(400).json({ error: "NO job found" });

    await Application.deleteMany({job: jobId})
    const user = await User.findById(userId)
    if(!user) return res.status(400).json({error: "User not found"})
    
      await User.updateMany(
        { jobsApplied: jobId },
        { $pull: { jobsApplied: jobId } }
      );

    await Job.findByIdAndDelete(jobId);

    res.status(200).json({ message: "Post deleted" });
  } catch (error) {
    console.log("Error in Delete controller ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const UpdateJobPost = async (req, res) => {
  const { id: jobId } = req.params;
  const { userId } = req.user;
  try {
    const job = await Job.findById(jobId);
    if (!job) return res.status(400).json({ error: "Job not found" });

    if (job.employer.toString() !== userId.toString())
      return res
        .status(400)
        .json({ error: "You are not authorized to perform this task." });

    job.isAccepting = false;

    await job.save();

    res.status(200).json({ message: "Job post updated successfully" });
  } catch (error) {
    console.log("Error in Update Post controller ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const GetAllJobs = async (req, res) => {
  const {
    query: { filter },
  } = req;

  try {
    // Build the query object dynamically
    const queryData = filter
      ? {
          $or: [
            { role: { $regex: filter, $options: 'i' } }, // Case-insensitive match
            { company: { $regex: filter, $options: 'i' } },
            { location: { $regex: filter, $options: 'i' } },
            { experience: { $regex: filter, $options: 'i' } },
          ],
        }
      : {}; // If no filter, return all jobs with an empty query

    // Fetch jobs based on the filter or all jobs
    const jobs = await Job.find(queryData);

    // Return the jobs
    res.status(200).json(jobs);
  } catch (error) {
    console.error("Error in GetAllJobs controller: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const GetLatestJobs = async (req, res) => {
  const {
    query: { filter },
  } = req;

  try {
    // Build the query object dynamically
    const queryData = filter
      ? {
          $or: [
            { role: { $regex: filter, $options: 'i' } }, // Case-insensitive match
            { company: { $regex: filter, $options: 'i' } },
            { location: { $regex: filter, $options: 'i' } },
            { experience: { $regex: filter, $options: 'i' } },
          ],
        }
      : {}; // If no filter, return all jobs with an empty query

    // Fetch jobs based on the filter or all jobs
   if(filter){ 
    const jobs = await Job.find(queryData);
    return res.status(200).json(jobs)
  }

  const latestJobs = await Job.find().sort({createdAt: -1}).limit(6)
    // Return the jobs
    res.status(200).json(latestJobs);
  } catch (error) {
    console.error("Error in GetAllJobs controller: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


export const searchJobs = async (req, res) => {
  // All three query parameters are required
  const { role, type, location } = req.query; // assuming keywords are passed as a query parameter

  try {
    const jobs = await Job.find({
      $or: [
        { title: { $regex: role, $options: "i" } },
        { title: { $regex: type, $options: "i" } },
        { location: { $regex: location, $options: "i" } },
      ],
    });
    res.status(200).json(jobs);
  } catch (error) {
    console.log("Error in searchJob controller ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Application controller

export const ApplyForJob = async (req, res) => {
  const { id: jobId } = req.params;
  const { coverLetter } = req.body;
  const { userId } = req.user;

  try {
    const user = await User.findById(userId);
    const job = await Job.findById(jobId);
    if (!job) return res.status(400).json({ error: "Can not find this job." });

    //check is user have already applied for job
    if (user.jobsApplied.includes(jobId))
      return res
        .status(400)
        .json({ error: "You have already applied for this job" });

    // check if you are applying to self
    if (job.employer.toString() === userId.toString())
      return res
        .status(401)
        .json({ error: "You can not apply to your own application" });

    //Check if applications for this is being accepted
    if (!job.isAccepting)
      return res.status(400).json({
        error: "Sorry, We are no longer accepting application for this job",
      });

    // create new application
    const newApplication = new Application({
      applicant: userId,
      job: jobId,
      coverLetter: coverLetter,
    });

    await newApplication.save();

    job.applications.push(newApplication._id);
    user.jobsApplied.push(jobId);
    // await job.save();
    // await user.save()
    Promise.all([job.save(), user.save()]);

    res.status(200).json({ message: "Application submited" });
  } catch (error) {
    console.log("Error in ApplyForJob controller ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const FindPost = async (req, res) => {
  const id = req.params.id;
  try {
    const job = await Job.findById(id);
    if (!job) return res.status(400).json({ error: "Can't find job" });

    res.status(200).json(job);
  } catch (error) {
    console.log("Error in findJob controller ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const JobsPostedByMe = async (req, res) => {
  const { userId } = req.user;
  try {
    if (!userId) return res.status(400).json({ error: "Unauthorized" });
    const postedJobs = await Job.find({employer: userId})
    if(!postedJobs)
      return res.status(200).json([])

    
    res.status(200).json(postedJobs);
  } catch (error) {
    console.log("Error in JobsPostedByMe : ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const SeeApplications = async (req, res) => {
  const jobId = req.params.id
  try {
    const job = await Job.findById(jobId).populate({path: "applications", populate: {path: "applicant", select: "fullname email"}})
    if(!job)
      return res.status(400).json({error: `Can't find job : ${jobId}`})
    const applications = job.applications
    
    res.status(200).json({applications, job: job.role, description: job.description});
  } catch (error) {
    console.log("Error in SeeApplications: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export const GetAppliedJobs = async (req, res) => {
  const { userId } = req.user;
  try {
    const applications = await Application.find({applicant: userId}).populate({path:"job"});

    if(!applications) 
      return res.status(200).json({applications})

    res.status(200).json(applications)
  } catch (error) {
    console.log("Error in GetAppliedJobs controller ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const AcceptApplication = async (req, res) => {
  const {id: applicationId} = req.params
  try {
    const application = await Application.findById(applicationId)
    if(!application) return res.status(404).json({error: "Application not found"})

    application.status = "accepted"
    await application.save()
  } catch (error) {
    console.log("Error in AcceptApplication controller : ", error)
    res.status(500).json({error: "Internal server error"})
  }
}

export const RejectApplication = async (req, res) => {
  const {id: applicationId} = req.params
  try {
    const application = await Application.findById(applicationId)
    if(!application) return res.status(404).json({error: "Application not found"})

    application.status = "rejected"
    await application.save()
  } catch (error) {
    console.log("Error in AcceptApplication controller : ", error)
    res.status(500).json({error: "Internal server error"})
  }
}