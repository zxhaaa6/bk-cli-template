export default `
  type UserType {
    id: ID!
    name: String
    email: String
  }

  type Query {
    users: [UserType]
  }
`;
