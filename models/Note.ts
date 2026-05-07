import mongoose from "mongoose";

export interface INote extends mongoose.Document {
  fileName: string;
  title?: string | null;
  content: any; // Tiptap JSON document
  folderId?: mongoose.Types.ObjectId | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

const NoteSchema = new mongoose.Schema<INote>(
  {
    fileName: {
      type: String,
      required: [true, "Please provide a file name"],
      maxlength: [100, "File name cannot be more than 100 characters"],
      trim: true,
    },
    title: {
      type: String,
      maxlength: [100, "Title cannot be more than 100 characters"],
      trim: true,
      default: null,
    },
    content: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    folderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Folder",
      default: null,
    },
    userId: {
      type: String,
      required: [true, "Please provide a userId"],
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  },
);

// Add compound index for performance
NoteSchema.index({ userId: 1, folderId: 1 });
NoteSchema.index({ userId: 1, updatedAt: -1 });

// Prevent mongoose from recreating the model if it already exists
export default mongoose.models.Note ||
  mongoose.model<INote>("Note", NoteSchema);
