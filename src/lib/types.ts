export interface ParticipantRow {
  id: string;
  name: string;
  pin_hash: string | null;
  failed_attempts: number;
  total_failed_attempts: number;
  locked_until: string | null;
  permanently_locked: boolean;
  created_at: string;
}

export interface MatchRow {
  id: string;
  giver_name: string;
  receiver_name: string;
  created_at: string;
}

export interface DrawStateRow {
  id: number;
  completed: boolean;
  completed_at: string | null;
}

export interface WishlistItemRow {
  id: string;
  owner_name: string;
  description: string;
  link: string | null;
  image_url: string | null;
  created_at: string;
}
