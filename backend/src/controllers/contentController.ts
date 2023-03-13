const publicContent = (req,res) => {
    res.status(200).send("Public Content");
}

const guestContent = (req,res) => {
    res.status(200).send("Guest Content");
}

const userContent = (req,res) => {
    res.status(200).send("User Content");
}

const adminContent = (req,res) => {
    res.status(200).send("Admin Content");
}

export const contentController = {
    publicContent,
    guestContent,
    userContent,
    adminContent
}