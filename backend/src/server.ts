import app from "./app";
import dotenv from "dotenv";
import { initDatabase } from "./config/initDatabase";


dotenv.config();
const PORT = process.env.PORT || 3000;

initDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`Backend running on port ${PORT}}`);
    });
});
