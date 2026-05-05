import mongoose from "mongoose";

export interface IFolder extends mongoose.Document {
  name: string;
  createdAt: Date;
}

const FolderSchema = new mongoose.Schema<IFolder>(
  {
    name: {
      type: String,
      required: [true, "Please provide a folder name"],
      maxlength: [50, "Folder name cannot be more than 50 characters"],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent mongoose from recreating the model if it already exists
export default mongoose.models.Folder ||
  mongoose.model<IFolder>("Folder", FolderSchema);
