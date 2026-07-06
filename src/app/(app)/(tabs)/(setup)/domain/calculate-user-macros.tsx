export function CalculateUserMacros(planCalories: number): { proteinGrams: number; fatGrams: number; carbGrams: number } {
    const proteinCalories = planCalories * 0.3;
    const fatCalories = planCalories * 0.25;
    const carbCalories = planCalories * 0.45;

    const proteinGrams = proteinCalories / 4;
    const fatGrams = fatCalories / 9;
    const carbGrams = carbCalories / 4;

    return {
        proteinGrams,
        fatGrams,
        carbGrams,
    };
}