// types/index.ts
export interface User {
    id: string;
    name: string;
    phone: string;
    profile_photo: string | null;
    created_at: string;
    email?: string;
  }
  
  export interface Listing {
    id: string;
    user_id: string;
    title: string;
    description: string | null;
    category: string;
    price: number;
    unit: string;
    quantity: number | null;
    location: string | null;
    lat: number | null;
    lng: number | null;
    images: string[];
    phone: string | null;
    status: 'active' | 'banned';
    created_at: string;
  }
  
  export interface Conversation {
    id: string;
    user1_id: string;
    user2_id: string;
    last_message_at: string;
  }
  
  export interface Message {
    id: string;
    conversation_id: string;
    sender_id: string;
    message: string | null;
    image: string | null;
    read: boolean;
    created_at: string;
  }