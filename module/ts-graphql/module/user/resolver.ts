export default {
  UserType: {
    name(root, args, { User }) {
      return `${root.firstName} ${root.lastName}`;
    },
  },
  Query: {
    users(root, _, { User }) {
      return User.getUsers();
    },
  },
};
