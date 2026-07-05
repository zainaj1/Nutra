/// <reference types="jest" />

import CalculateUserPlan from '../../src/app/(app)/(tabs)/(setup)/domain/calculate-user-plan';
import {
  ActivityLevel,
  activityMultiplier,
  Gender,
  User,
  UserGoal,
} from '../../src/app/(app)/(tabs)/(setup)/domain/user';

const CALORIES_PER_POUND = 3500;
const DAYS_PER_WEEK = 7;
const MIN_WEIGHT = 100;
const MAX_WEIGHT = 300;
const MIN_HEIGHT = 48;
const MAX_HEIGHT = 95;
const MIN_AGE = 14;
const MAX_AGE = 120;
const MIN_PACE = 0.5;
const MAX_PACE = 2;

const activityLevels: ActivityLevel[] = [
  'SEDENTARY',
  'LIGHTLY_ACTIVE',
  'MODERATELY_ACTIVE',
  'VERY_ACTIVE',
];

const genders: Gender[] = ['MALE', 'FEMALE', 'OTHER'];

const baseUser: User = {
  weight: 180,
  height: 70,
  age: 30,
  gender: 'MALE',
  activityLevel: 'MODERATELY_ACTIVE',
};

function buildUser(overrides: Partial<User> = {}): User {
  return {
    ...baseUser,
    ...overrides,
  };
}

function buildGoal(overrides: Partial<UserGoal> = {}): UserGoal {
  return {
    goalWeight: 170,
    pace: 1,
    ...overrides,
  };
}

function calculateExpectedBmr(user: User) {
  const genderAdjustment = user.gender === 'FEMALE' ? -161 : 5;

  return (
    4.536 * user.weight +
    15.88 * user.height -
    5.0 * user.age +
    genderAdjustment
  );
}

function calculateWeeklyPaceCalories(goal: UserGoal) {
  return goal.pace * CALORIES_PER_POUND / DAYS_PER_WEEK;
}

function calculateExpectedPlan(user: User, goal: UserGoal) {
  const bmr = calculateExpectedBmr(user);
  const tdee = bmr * activityMultiplier[user.activityLevel];
  const direction = goal.goalWeight < user.weight ? -1 : 1;
  const planCalories = tdee + calculateWeeklyPaceCalories(goal) * direction;

  return {
    bmr,
    tdee,
    planCalories,
  };
}

describe('CalculateUserPlan', () => {
  it('calculates baseline calories from user metrics and activity level', () => {
    const goal = buildGoal({ goalWeight: baseUser.weight, pace: 0 });

    const plan = CalculateUserPlan(baseUser, goal);
    const expected = calculateExpectedPlan(baseUser, goal);

    expect(plan.bmi).toBeCloseTo(expected.bmr);
    expect(plan.tdee).toBeCloseTo(expected.tdee);
    expect(plan.planCalories).toBeCloseTo(expected.tdee);
  });

  it('subtracts calories when the goal is weight loss', () => {
    const goal = buildGoal({ goalWeight: 170, pace: 1 });

    const plan = CalculateUserPlan(baseUser, goal);
    const expected = calculateExpectedPlan(baseUser, goal);

    expect(plan.planCalories).toBeCloseTo(expected.planCalories);
    expect(plan.planCalories).toBeLessThan(plan.tdee);
  });

  it('adds calories when the goal is weight gain', () => {
    const goal = buildGoal({ goalWeight: 190, pace: 0.5 });

    const plan = CalculateUserPlan(baseUser, goal);
    const expected = calculateExpectedPlan(baseUser, goal);

    expect(plan.planCalories).toBeCloseTo(expected.planCalories);
    expect(plan.planCalories).toBeGreaterThan(plan.tdee);
  });

  it('uses the female equation adjustment when gender is female', () => {
    const femaleUser = buildUser({ gender: 'FEMALE' });
    const goal = buildGoal({ goalWeight: femaleUser.weight, pace: 0 });

    const plan = CalculateUserPlan(femaleUser, goal);

    expect(plan.bmi).toBeCloseTo(calculateExpectedBmr(femaleUser));
  });

  it.each(genders)('calculates the expected baseline for %s users', (gender) => {
    const user = buildUser({ gender });
    const goal = buildGoal({ goalWeight: user.weight, pace: 0 });

    const plan = CalculateUserPlan(user, goal);
    const expected = calculateExpectedPlan(user, goal);

    expect(plan.bmi).toBeCloseTo(expected.bmr);
    expect(plan.tdee).toBeCloseTo(expected.tdee);
    expect(plan.planCalories).toBeCloseTo(expected.tdee);
  });

  it.each(activityLevels)('applies the %s activity multiplier', (activityLevel) => {
    const user = buildUser({ activityLevel });
    const goal = buildGoal({ goalWeight: user.weight, pace: 0 });

    const plan = CalculateUserPlan(user, goal);
    const expected = calculateExpectedPlan(user, goal);

    expect(plan.tdee).toBeCloseTo(expected.tdee);
    expect(plan.planCalories).toBeCloseTo(expected.tdee);
  });

  it.each(genders.flatMap((gender) => (
    activityLevels.map((activityLevel) => ({ gender, activityLevel }))
  )))(
    'keeps weight-loss calories below TDEE for $gender users who are $activityLevel',
    ({ gender, activityLevel }) => {
      const user = buildUser({ gender, activityLevel });
      const goal = buildGoal({ goalWeight: user.weight - 10, pace: 1 });

      const plan = CalculateUserPlan(user, goal);
      const expected = calculateExpectedPlan(user, goal);

      expect(plan.planCalories).toBeCloseTo(expected.planCalories);
      expect(plan.planCalories).toBeLessThan(plan.tdee);
    }
  );

  it.each(genders.flatMap((gender) => (
    activityLevels.map((activityLevel) => ({ gender, activityLevel }))
  )))(
    'keeps weight-gain calories above TDEE for $gender users who are $activityLevel',
    ({ gender, activityLevel }) => {
      const user = buildUser({ gender, activityLevel });
      const goal = buildGoal({ goalWeight: user.weight + 10, pace: 1 });

      const plan = CalculateUserPlan(user, goal);
      const expected = calculateExpectedPlan(user, goal);

      expect(plan.planCalories).toBeCloseTo(expected.planCalories);
      expect(plan.planCalories).toBeGreaterThan(plan.tdee);
    }
  );

  it.each([
    {
      name: 'minimum app values with minimum pace',
      user: buildUser({
        weight: MIN_WEIGHT,
        height: MIN_HEIGHT,
        age: MIN_AGE,
        gender: 'FEMALE',
        activityLevel: 'SEDENTARY',
      }),
      goal: buildGoal({
        goalWeight: MIN_WEIGHT - 5,
        pace: MIN_PACE,
      }),
    },
    {
      name: 'maximum app values with maximum pace',
      user: buildUser({
        weight: MAX_WEIGHT,
        height: MAX_HEIGHT,
        age: MAX_AGE,
        gender: 'MALE',
        activityLevel: 'VERY_ACTIVE',
      }),
      goal: buildGoal({
        goalWeight: MAX_WEIGHT + 5,
        pace: MAX_PACE,
      }),
    },
  ])('handles $name', ({ user, goal }) => {
    const plan = CalculateUserPlan(user, goal);
    const expected = calculateExpectedPlan(user, goal);

    expect(plan.bmi).toBeCloseTo(expected.bmr);
    expect(plan.tdee).toBeCloseTo(expected.tdee);
    expect(plan.planCalories).toBeCloseTo(expected.planCalories);
    expect(Number.isFinite(plan.planCalories)).toBe(true);
  });

  it('keeps plan calories at TDEE when pace is zero', () => {
    const goal = buildGoal({
      goalWeight: baseUser.weight - 20,
      pace: 0,
    });

    const plan = CalculateUserPlan(baseUser, goal);

    expect(plan.planCalories).toBeCloseTo(plan.tdee);
  });
});
