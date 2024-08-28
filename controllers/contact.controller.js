import Message from "../model/contact.model.js";
export const sendMessage = async (req, res) => {
  const { email, name, message } = req.body;

  try {
    const newMessage = new Message({
      email,
      name,
      message,
    });

    await newMessage.save()

    res.status(200).json(newMessage)
  } catch (error) {
    res.status(500).json({error: "Internal server Error"})
    console.log("Error in Send message controller", error)
  }
};
