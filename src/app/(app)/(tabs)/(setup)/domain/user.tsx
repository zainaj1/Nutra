export type ActivityLevel =
    "SEDENTARY" |
    "LIGHTLY_ACTIVE" |
    "MODERATELY_ACTIVE" |
    "VERY_ACTIVE";

export const activityMultiplier: Record<ActivityLevel, number> = {
    SEDENTARY: 1.1,
    LIGHTLY_ACTIVE: 1.3,
    MODERATELY_ACTIVE: 1.5,
    VERY_ACTIVE: 1.7
}

export type Gender = "MALE" | "FEMALE" | "OTHER"

export type User = {
    weight: number,
    height: number,
    age: number,
    gender: Gender,
    activityLevel: ActivityLevel
}

export type UserGoal = {
    goalWeight: number,
    pace: number,
}