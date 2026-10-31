export type CreateContactData = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  userId?: string | null;
};
