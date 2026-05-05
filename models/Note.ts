import mongoose from "mongoose";

export interface INote extends mongoose.Document {
  title: string;
  content: string[];
  folderId?: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const NoteSchema = new mongoose.Schema<INote>(
  {
    title: {
      type: String,
      required: [true, "Please provide a title"],
      maxlength: [100, "Title cannot be more than 100 characters"],
    },
    content: {
      type: [String],
      default: [],
    },
    folderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Folder",
      default: null,
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

// Prevent mongoose from recreating the model if it already exists
export default mongoose.models.Note || mongoose.model<INote>("Note", NoteSchema);
