import Application from "../model/application.model.js";
import Job from "../model/job.model.js";
import User from "../model/user.model.js";

export const PostJob = async (req, res) => {
  const {
    title,
    company,
    location,
    employment_type,
    description,
    requirements,
    salary,
    application_deadline,
  } = req.body;
  const { userId } = req.user;
  try {
    const newJob = new Job({
      employer: userId,
      title,
      company,
      location,
      employment_type,
      description,
      requirements,
      salary,
      application_deadline,
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

    if (job.employer.toString() !== userId.toString())
      return res
        .status(400)
        .json({ error: "You are not authorized to delete this post." });

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
  const { userId } = req.user;
  try {
    const jobs = await Job.find({ employer: { $ne: userId } });
    res.status(200).json(jobs);
  } catch (error) {
    console.log("Error in GetAllJobs controller ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const searchJobs = async (req, res) => {
  // All three query parameters are required
  const { title,company,location }  = req.query; // assuming keywords are passed as a query parameter

  try {
    const jobs = await Job.find({
      $or: [
        { title: { $regex: title, $options: 'i' } },
        { company: { $regex: company, $options: 'i' } },
        { location: { $regex: location, $options: 'i' } },
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
      return res
        .status(400)
        .json({
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
