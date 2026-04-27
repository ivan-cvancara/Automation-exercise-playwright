export type TestUser = {
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  email: string;
  dateOfBirth?: string;
  firstname?: string;
  lastname?: string;
  company?: string;
  address: string;
  country: string;
  state: string;
  city: string;
  zipcode: string;
  mobileNumber: string;
};

export type UsersFile = {
  users: Record<string, TestUser>;
};
