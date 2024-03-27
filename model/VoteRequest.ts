export interface VoteRequest {
    vote_id:    number;
    user_id:    number;
    img_id:     number;
    point:      number;
    vote_score: number;
    created_at: Date;
}
