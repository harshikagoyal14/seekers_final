export type Role = "member" | "business" | "community_owner" | "moderator" | "admin";

export type Profile = {
  id: string;
  user_id: string;
  name: string;
  photo_url: string | null;
  location: string | null;
  bio: string | null;
  designation: string | null;
  company: string | null;
  industry: string | null;
  directory_visible: boolean;
  leaderboard_opt_in: boolean;
  spotlight_opt_in: boolean;
  roles: Role[];
  invite_code: string;
  invited_by: string | null;
  attributed_owner_id: string | null;
  grandfathered: boolean;
  tier: string;
  created_at: string;
};

export type BusinessProfile = {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  type: "business" | "freelancer";
  category_id: string | null;
  bio: string | null;
  logo_path: string | null;
  location: string | null;
  years: number | null;
  approval_status: "pending" | "approved" | "rejected";
  approved_at: string | null;
  rating: number | null;
  created_at: string;
};

export type ReferralStatus =
  | "INITIATED"
  | "ACCEPTED"
  | "CONTACTED"
  | "IN_PROGRESS"
  | "CLOSED_WON"
  | "CLOSED_LOST"
  | "EXPIRED"
  | "UNRESOLVED"
  | "DISPUTED";

export type ReferralLabel = "Pending" | "In progress" | "Closed · won" | "Closed · no deal" | "Needs attention";

export const STATUS_LABEL: Record<ReferralStatus, ReferralLabel> = {
  INITIATED:    "Pending",
  ACCEPTED:     "Pending",
  CONTACTED:    "In progress",
  IN_PROGRESS:  "In progress",
  CLOSED_WON:   "Closed · won",
  CLOSED_LOST:  "Closed · no deal",
  EXPIRED:      "Closed · no deal",
  UNRESOLVED:   "Closed · no deal",
  DISPUTED:     "Needs attention",
};

export type Referral = {
  id: string;
  code: string;
  type: "self_service" | "third_party";
  referrer_id: string;
  business_id: string;
  seeker_id: string | null;
  state: ReferralStatus;
  deal_value_paise: number | null;
  credits: number | null;
  created_at: string;
  updated_at: string;
};

export type CatalogueItem = {
  id: string;
  business_id: string;
  title: string;
  description: string | null;
  price_paise: number | null;
  price_label: string | null;
  image_path: string | null;
  position: number;
  hidden: boolean;
};

export type Category = {
  id: string;
  slug: string;
  name: string;
  referral_fee_allowed: boolean;
  regulator: string | null;
};

export type Enquiry = {
  id: string;
  business_id: string;
  sender_profile_id: string | null;
  name: string;
  contact_encrypted: string;
  message: string;
  status: "new" | "replied" | "became_customer";
  became_customer: boolean;
  created_at: string;
};

export type Event = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  date_time: string;
  location: string | null;
  online_url: string | null;
  capacity: number | null;
  is_paid: boolean;
  price_paise: number | null;
  host_id: string;
  status: "upcoming" | "past" | "cancelled";
  cover_image: string | null;
};

export type KnowledgePost = {
  id: string;
  url: string;
  title: string;
  description: string | null;
  preview_image: string | null;
  preview_title: string | null;
  site_name: string | null;
  category: string;
  source: "member" | "editorial";
  status: "pending" | "approved" | "rejected";
  author_id: string;
  created_at: string;
};

export type Badge = {
  id: string;
  business_id: string;
  type: "verified_business" | "verified_freelancer";
  granted_at: string;
  expires_at: string | null;
  revoked_at: string | null;
};

export type Review = {
  id: string;
  type: "verified" | "testimonial";
  business_id: string;
  author_profile_id: string | null;
  referral_id: string | null;
  enquiry_id: string | null;
  rating: number | null;
  text: string;
  status: "pending" | "approved" | "rejected";
  reply: string | null;
};
