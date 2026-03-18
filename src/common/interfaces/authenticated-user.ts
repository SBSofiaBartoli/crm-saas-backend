export class AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  company: string | null;
  createdAt: Date;
  updatedAt: Date;
}
