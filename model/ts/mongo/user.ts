import * as mongoose from 'mongoose';
const Schema = mongoose.Schema;

export interface IUser extends mongoose.Document {
  firstName: string;
  lastName: string;
  active: boolean;
  dateCreated: Date;
  dateModified: Date;
}

const UserSchema = new Schema(
  {
    firstName: String,
    lastName: String,
    active: { type: Boolean, default: true },
    dateCreated: { type: Date, default: Date.now },
    dateModified: { type: Date, default: Date.now },
  },
  { collection: 'user' },
);

UserSchema.index({
  active: 1,
});

export const User: mongoose.Model<IUser> = mongoose.model<IUser>(
  'User',
  UserSchema,
);
