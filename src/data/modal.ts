// models.ts

// ===================================
// CORE & SHARED MODELS
// ===================================

/**
 * Represents a Brand of a vehicle.
 */
export interface Brand {
    id: number;
    name: string;
    image_source: string;
}

/**
 * Represents a specific model of a vehicle (e.g., CR-V for Honda).
 */
export interface VehicleModel {
    id: number;
    name: string;
}

/**
 * Represents an interior or exterior feature of a vehicle.
 */
export interface Feature {
    id: number;
    name: string;
}

/**
 * Represents a user of the application.
 */
export interface User {
    id: number;
    agent_id: number | null;
    is_approved: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    bio: string | null;
    phone: string | null;
    photo: string | null;
    target: string | null;
    created_at: string;
    updated_at: string;
    roles: string[];
    permissions: string[];
    // Added from register response for consistency
    package_id?: number;
}


// ===================================
// AUCTION & VEHICLE MODELS
// ===================================

/**
 * Represents the full details of a vehicle, primarily used in auctions.
 * This interface combines fields from both the auction list and auction details endpoints.
 */
export interface Vehicle {
    id: number;
    title: string;
    slug: string;
    brand_id: number;
    vehicle_model_id: number;
    variant: string | null;
    year: number;
    body_type_id: number;
    fuel_type_id: number;
    transmission_id: number;
    mileage: number;
    engine_cc: number;
    horsepower: number;
    torque: number | null;
    seats: number | null;
    doors: number | null;
    color: string | null;
    interior_color: string | null;
    drive_type: string | null;
    vin: string;
    registration_no: string;
    price: string;
    negotiable: boolean;
    condition: 'new' | 'used' | string;
    description: string | null;
    status: 'published' | 'draft' | string;
    is_featured: boolean;
    view_count: number | null;
    sold_at: string | null;
    top_speed: string | null;
    is_auction: boolean;
    current_bid: number | null;
    engine_type: string | null;
    auction_start_date: string;
    auction_end_date: string;
    auction_location: string | null;
    shipping_information: string | null;
    reserve_status: string | null;
    auction_id: string | null;
    live_auction: boolean | null;
    no_of_cylinder: string | null;
    register_emirates: string | null;
    starting_bid_amount: number;
    zero_to_sixty: string | null;
    quater_mile: string | null;
    is_hot: number;
    inspected_by: string | null;
    pre_owned: number;
    remarks: string | null;
    trim: string | null;
    bid_control: number;
    created_at: string;
    updated_at: string;
    brand: Brand;
    vehicle_model: VehicleModel;
    features?: Feature[];
    images?: any[];
    bids_count: number;
    cover_image?: string | null;
}


// ===================================
// BIDDING MODELS
// ===================================
export interface Bid {
    id: number;
    vehicle_id: number;
    user_id: number;
    bid_amount: number;
    bid_time: string;
    status: 'pending' | string;
    created_at: string;
    updated_at: string;
    current_bid: number | null;
    max_bid: number;
    user: {
        id: number;
        name: string;
    };
}


// ===================================
// PACKAGE MODELS
// ===================================
export interface Package {
    id: number;
    name: string;
    description: string;
    price: string;
    duration_days: number;
    features: string[];
    created_at: string;
    updated_at: string;
}


// ===================================
// API RESPONSE WRAPPERS (Specific Endpoints)
// ===================================

/**
 * Response shape for the POST /login endpoint.
 */
export interface LoginResponse {
    status: string;
    access_token: string;
    token_type: string;
    expires_in: number;
    user: User;
}

/**
 * [NEW] Response shape for the POST /register endpoint.
 */
export interface RegisterResponse {
    status: string;
    message: string;
    token: string;
    user: User;
}


/**
 * Response shape for the POST /logout endpoint.
 */
export interface LogoutResponse {
    status: string;
    message: string;
}

/**
 * Response shape for the GET /auctions/show/{id} endpoint.
 */
export interface AuctionDetailsResponse {
    status: string;
    data: {
        vehicle: Vehicle;
        main_image: string | null;
        tags: any[];
        exterior_features: Feature[];
        interior_features: Feature[];
        all_exterior_features: Feature[];
        all_interior_features: Feature[];
    };
}

/**
 * Response shape for the GET /biddings/{id} endpoint.
 */
export interface BiddingInfoResponse {
    status: string;
    data: {
        vehicle: Vehicle;
        total_bids: number;
        highest_bid: number;
        bids: Bid[];
        minimum_next_bid: number;
    };
}

/**
 * Response shape for the POST /place-bid/{id} endpoint.
 */
export interface PlaceBidResponse {
    status: string;
    message: string;
    data: {
        id: number;
        vehicle_id: number;
        user_id: number;
        bid_amount: string;
        max_bid: string;
        created_at: string;
        updated_at: string;
    };
}


// ===================================
// GENERIC API WRAPPERS
// ===================================
export interface PaginatedResponse<T> {
    current_page: number;
    data: T[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: { url: string | null; label: string; active: boolean; }[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
}

export interface ApiResponse<T> {
    status: string;
    data: T;
    message?: string;
}

export interface ApiResult<T> {
    success: boolean;
    status: number;
    data: T;
}