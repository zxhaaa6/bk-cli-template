import { mergeResolvers } from 'merge-graphql-schemas';
import { userResolvers } from './user';

const resolvers = [userResolvers];

export default mergeResolvers(resolvers);
