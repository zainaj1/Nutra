import { CalculateUserMacros } from './calculate-user-macros';
import CalculateUserPlan from './calculate-user-plan';
import { User, UserGoal } from './user';

export type UserPlanValues = {
    planCalories: number;
    proteinGrams: number;
    fatGrams: number;
    carbGrams: number;
    totalWeeksToReachGoal: number;
};

export default class UserPlan {
    readonly planCalories: number;
    readonly proteinGrams: number;
    readonly fatGrams: number;
    readonly carbGrams: number;
    readonly totalWeeksToReachGoal: number;

    constructor({
        planCalories,
        proteinGrams,
        fatGrams,
        carbGrams,
        totalWeeksToReachGoal,
    }: UserPlanValues) {
        this.planCalories = planCalories;
        this.proteinGrams = proteinGrams;
        this.fatGrams = fatGrams;
        this.carbGrams = carbGrams;
        this.totalWeeksToReachGoal = totalWeeksToReachGoal;
    }

    static from(user: User, userGoal: UserGoal) {
        const { planCalories } = CalculateUserPlan(user, userGoal);
        const { proteinGrams, fatGrams, carbGrams } = CalculateUserMacros(planCalories);
        const totalWeeksToReachGoal = Math.abs(user.weight - userGoal.goalWeight) / userGoal.pace;

        return UserPlan.fromValues({
            planCalories,
            proteinGrams,
            fatGrams,
            carbGrams,
            totalWeeksToReachGoal,
        });
    }

    static fromValues({
        planCalories,
        proteinGrams,
        fatGrams,
        carbGrams,
        totalWeeksToReachGoal,
    }: UserPlanValues) {
        return new UserPlan({
            planCalories,
            proteinGrams,
            fatGrams,
            carbGrams,
            totalWeeksToReachGoal,
        });
    }
}
