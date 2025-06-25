// models/Interview.ts
import mongoose, { Schema } from 'mongoose';

const InterviewSchema = new Schema({
  transcript: String,
  feedback: String,
  createdAt: { type: Date, default: Date.now },
});

// Prevent model overwrite issue during dev with hot-reloading
export default mongoose.models.Interview ||
  mongoose.model('Interview', InterviewSchema);
