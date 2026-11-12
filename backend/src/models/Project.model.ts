import { Schema, model, Document, Types } from 'mongoose';

export interface IProject extends Document {
  title: string;
  description: string;
  status: 'Planning' | 'Active' | 'Completed' | 'On-Hold';
  owner: Types.ObjectId;
  team: Types.ObjectId[];
  budget: number;
  deadline: Date;
}

const ProjectSchema = new Schema<IProject>({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  status: { type: String, enum: ['Planning', 'Active', 'Completed', 'On-Hold'], default: 'Planning' },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  team: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  budget: { type: Number, required: true, min: 0 },
  deadline: { type: Date, required: true }
}, { timestamps: true });

// Indexing for performance optimization
ProjectSchema.index({ status: 1, owner: 1 });

export const Project = model<IProject>('Project', ProjectSchema);
