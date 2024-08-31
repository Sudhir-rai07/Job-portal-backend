import Job from "../model/job.model.js"

export const PostJob = async (req, res) =>{
    const {title,company,location,employment_type,description,requirements,salary,posted_date,application_deadline } = req.body
    const {userId} = req.user
    try {
        const newJob = await new Job({
            user:userId,
            title,
            company,
            location,
            employment_type,
            description,
            requirements,
            salary,
            posted_date,
            application_deadline
        })

        await newJob.save()
        res.send("Hello")
    } catch (error) {
        console.log("Error in post controller ", error)
        res.status(500).json({error: "Internal server error"})
    }
}