export interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  maxAttendees: number;
  createdBy: {
    _id: string;
    name: string;
    email: string;
    profileImage?: string;
  };
  createdAt: string;
  updatedAt: string;
  rsvps: {
    [key: string]: {
      status: 'going' | 'maybe' | 'not_going';
      notes?: string;
      user: {
        _id: string;
        name: string;
        email: string;
        profileImage?: string;
      };
    };
  };
  rsvpStatus?: 'going' | 'maybe' | 'not_going';
  rsvpNotes?: string;
} 