export type AdminUser = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    venues: number;
  };
};

export type ImpersonationState = {
  isImpersonating: boolean;
  originalUserId: string;
  originalUserEmail: string;
  originalUserName: string | null;
  impersonatedUserId: string;
  impersonatedUserEmail: string;
  impersonatedUserName: string | null;
};

