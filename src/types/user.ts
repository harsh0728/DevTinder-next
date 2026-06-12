export interface User{
    _id:string;
    name:string;
    email:string;
    password:string;
    profilePic?:string;
    bio?:string;
    skills?:string[];
    experience?:string;
    location?:string;
    createdAt:string;
    updatedAt:string;
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

export interface ApiResponse<T>{
    success:boolean;
    data?:T;
    message?:string
}
