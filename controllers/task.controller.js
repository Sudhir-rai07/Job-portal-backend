import User from "../model/user.modal.js";
import Task from "../model/task.model.js";

export const SubmitTask = async (req, res) => {
  const { url, taskName } = req.body;
  const { _id: userId } = req.user;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(400).json({ error: "User not found" });

    const newTask = new Task({
      user: userId,
      taskName,
      url,
    })

    await newTask.save()

    res.status(200).json(newTask)
  } catch (error) {
    res.status(500).json({ error: "Internal serveer" });
    console.log("Error in submit Task controller", error);
  }
};

export const UpdateTask = async (req, res) =>{
    const {taskName, url} = req.body
    const {id: postId} = req.params

    try {
        const task = await Task.findById(postId)
        if(!task) return res.status(400).json({error : "Post not found"})

        task.taskName = taskName || task.taskName
        task.url = url || task.url

       await task.save()

       res.status(200).json({message: "Task updated", task})
    } catch (error) {
        res.status(500).json({ error: "Internal serveer" });
        console.log("Error in update Task controller", error);
      }
}

export const DeleteTask = async (req, res) =>{
    const {id:postId} = req.params
    try {
        const task = await Task.findByIdAndDelete(postId)
        if(!task) res.status(400).json({error: "Task not found"})

        res.status(200).json({message: "Task deleted"})
    }catch (error) {
        res.status(500).json({ error: "Internal serveer" });
        console.log("Error in Delete Task controller", error);
      }
}

export const getAllTasks = async (req, res) =>{
    const {_id: userId} = req.user
    try {
        const tasks = await Task.find({user: userId}).populate({
            path:"user",
            select: "-password"
        })
        if(!tasks) return res.status(200).json([])
         
            res.status(200).json(tasks)
    }catch (error) {
        res.status(500).json({ error: "Internal serveer" });
        console.log("Error in Getall Task controller", error);
      }
}