import { activityMultiplier, User, UserGoal } from "./user";

type UserPlan = {
    bmi: number;
    tdee: number;
    planCalories: number;
};

const WEIGHT_COEFFICIENT = 4.536;
const HEIGHT_COEFFICIENT = 15.88;
const AGE_COEFFICIENT = 5;
const MALE_CALORIE_ADJUSTMENT = 5;
const FEMALE_CALORIE_ADJUSTMENT = -161;
const CALORIES_PER_POUND = 3500;
const DAYS_PER_WEEK = 7;
const WEIGHT_LOSS_DIRECTION = -1;
const WEIGHT_GAIN_DIRECTION = 1;

function getGenderCalorieAdjustment(user: User) {
    return user.gender === "FEMALE"
        ? FEMALE_CALORIE_ADJUSTMENT
        : MALE_CALORIE_ADJUSTMENT;
}

function calculateBmi(user: User) {
    return (
        WEIGHT_COEFFICIENT * user.weight +
        HEIGHT_COEFFICIENT * user.height -
        AGE_COEFFICIENT * user.age +
        getGenderCalorieAdjustment(user)
    );
}

function calculateTdee(user: User, bmi: number) {
    return bmi * activityMultiplier[user.activityLevel];
}

function getGoalDirection(user: User, userGoal: UserGoal) {
    return userGoal.goalWeight < user.weight
        ? WEIGHT_LOSS_DIRECTION
        : WEIGHT_GAIN_DIRECTION;
}

function calculateDailyPaceCalories(userGoal: UserGoal) {
    return userGoal.pace * CALORIES_PER_POUND / DAYS_PER_WEEK;
}

function calculatePlanCalories(user: User, userGoal: UserGoal, tdee: number) {
    return tdee + calculateDailyPaceCalories(userGoal) * getGoalDirection(user, userGoal);
}

export default function CalculateUserPlan(user: User, userGoal: UserGoal): UserPlan {
    const bmi = calculateBmi(user);
    const tdee = calculateTdee(user, bmi);
    const planCalories = calculatePlanCalories(user, userGoal, tdee);

    return {
        bmi,
        tdee,
        planCalories,
    };
}
