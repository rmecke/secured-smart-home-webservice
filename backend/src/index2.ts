import express from 'express';
import cors from 'cors';
import { DB_CONFIG } from './config/dbConfig';
import { authRoutes } from './routes/authRoutes';
import { contentRoutes } from './routes/contentRoutes';
import { DB } from './models/index';
const User = DB.User;
const Role = DB.Role;
const ROLES = DB.ROLES;

DB.mongoose
    .connect(`mongodb://${DB_CONFIG.HOST}:${DB_CONFIG.PORT}/${DB_CONFIG.DATABASE}`, { 
    })
    .then(() => {
        console.log("Successfuly connected to MongoDB.");
        initial();
    })
    .catch(err => {
        console.error(`Error while connecting to MongoDB: ${err}`);
        process.exit();
    })

function initial() {
    Role.estimatedDocumentCount()
    .then((count) => {
        if (count === 0) {
            ROLES.forEach((role) => {
                new Role({
                    name: role
                })
                .save()
                .then(() => {
                    console.log(`Successfully added ${role} to roles collection.`);
                })
                .catch(err => {
                    console.error(`Error while adding ${role} to roles collection: ${err}`);
                })
            })
        }
    })
    .catch((err) => {
        console.error(`Error while retrieving Roles document count.`);
    })
}

var app = express();
var corsOptions = {
    origin: "http://localhost:3000"
}
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.get("/", (req,res) => {
    res.json({ message: "Welcome to the Secured Smart Home!"});
})

authRoutes(app);
contentRoutes(app);

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 54000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})