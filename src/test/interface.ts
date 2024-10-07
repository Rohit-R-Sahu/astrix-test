export interface User{
    userId?: number,
    username: string,
    name: string,
    email: string,
    token?: string,
    location?: string,
    gender?: string,
    role?: string,
    dob?: string,
    preferences?: string[],
    socials?: string[],
    phone?: number,
    description?: string,
    createdAt?: string,
    avatar?: string,
    privateKey?: string,
    address?: string,
    isOnboarded?: boolean,
    verified?: boolean,
    followerCount?: number,
    followingCount?: number,
    headers?: Headers
  };
  
export interface Headers{
      "Content-Type":string,
      "Authorization":string
  }