import { mergeTypes } from 'merge-graphql-schemas';
import userSchema from './user/schema';

const types = [userSchema];

export default mergeTypes(types, { all: true });
