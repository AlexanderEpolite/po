import type { Document } from "mongoose";

export interface IUser extends Document {
    user_id: string,
    temperature: number,
    system_prompt: string,
    has_shown_reset: boolean,
    seed_override?: number,
}