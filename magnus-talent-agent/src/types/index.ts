export type JDInput = { company?: string; role?: string; location?: string; jd_text: string; source?: string; };
export type MatchResult = { fit_score: number; keywords: string[]; };
export type RewritePayload = { tailored_resume: string; cover_letter: string; tokens_used?: number; };
