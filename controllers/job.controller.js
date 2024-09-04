import Job from "../model/job.model.js";

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
  } catch (error) {}
};
