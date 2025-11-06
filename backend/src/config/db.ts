import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI!);
        console.log(`db ok  ${conn.connection.host}`);
    } catch (error) {
        console.error("erreur db ", error);
        process.exit(1);
    }
};
