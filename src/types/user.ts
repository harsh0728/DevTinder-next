export interface User {
  _id: string;
  firstName: string;
  lastName?: string;
  email?: string;
  // password — never include this in frontend types
  age?: number;
  gender?: string;
  about?: string;
  photoUrl?: string;
  skills?: string[];
  isPremium?: boolean;
  createdAt?: string;
  updatedAt?: string;
  // __v — optional, only if you actually use it somewhere
}

export interface ConnectedUser extends User{
    connectionStatus: "interested" | "ignored";
}

export interface ConnectionRequest{
    _id:string;
    from:string;
    to:string;
    status:"interested" | "ignored";
    createdAt:string;
    updatedAt:string;
}

