import userDao from './userDao';

class Service {
  public dao: userDao;
  constructor() {
    this.dao = new userDao();
  }
  public getUsers() {
    return this.dao.retrieveUsers();
  }
}

export default Service;
