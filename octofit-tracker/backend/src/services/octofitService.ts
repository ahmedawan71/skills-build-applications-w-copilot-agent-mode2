import { Activity, Team, User, Workout } from '../models/index.js';
import mongoose from 'mongoose';

function requestError(status: number, message: string) {
  return Object.assign(new Error(message), { status });
}

function isRecord(input: unknown): input is Record<string, unknown> {
  return typeof input === 'object' && input !== null && !Array.isArray(input);
}

function requiredString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function validObjectId(value: unknown): value is string {
  return typeof value === 'string' && mongoose.Types.ObjectId.isValid(value);
}

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  if (!isRecord(input)
    || !validObjectId(input.userId)
    || !validObjectId(input.teamId)
    || !requiredString(input.type)
    || typeof input.minutes !== 'number'
    || !Number.isFinite(input.minutes)
    || input.minutes <= 0) {
    throw requestError(400, 'A valid userId, teamId, type, and positive minutes value are required');
  }

  const [user, team] = await Promise.all([
    User.exists({ _id: input.userId }),
    Team.exists({ _id: input.teamId }),
  ]);
  if (!user || !team) throw requestError(404, 'The specified user or team was not found');

  return Activity.create({
    user: input.userId,
    team: input.teamId,
    type: input.type,
    minutes: input.minutes,
    points: input.minutes,
    occurredAt: new Date(),
  });
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  if (!isRecord(input)
    || !requiredString(input.name)
    || !requiredString(input.mascot)
    || (input.members !== undefined && !Array.isArray(input.members))) {
    throw requestError(400, 'A team name, mascot, and valid members list are required');
  }

  const members = input.members ?? [];
  if (!members.every(validObjectId)) {
    throw requestError(400, 'Team members must be valid user IDs');
  }
  if (members.length > 0) {
    const existingMembers = await User.countDocuments({ _id: { $in: members } });
    if (existingMembers !== members.length) throw requestError(404, 'One or more team members were not found');
  }

  return Team.create({
    name: input.name,
    mascot: input.mascot,
    members,
  });
}

export async function getLeaderboard() {
  const teams = await Team.aggregate([
    {
      $lookup: {
        from: Activity.collection.name,
        localField: '_id',
        foreignField: 'team',
        as: 'activities',
      },
    },
    {
      $project: {
        teamName: '$name',
        totalPoints: { $sum: '$activities.points' },
      },
    },
    { $sort: { totalPoints: -1, teamName: 1 } },
  ]);
  return teams.map((team, index) => ({
    teamName: team.teamName,
    totalPoints: team.totalPoints,
    rank: index + 1,
  }));
}

function focusForActivity(type: string) {
  const normalizedType = type.trim().toLowerCase();
  if (['run', 'walk', 'cycle', 'cycling', 'bike', 'swim', 'cardio'].includes(normalizedType)) return 'endurance';
  if (['strength', 'resistance', 'weightlifting'].includes(normalizedType)) return 'strength';
  if (['yoga', 'stretching'].includes(normalizedType)) return 'flexibility';
  return normalizedType;
}

export async function suggestWorkouts(userEmail: string) {
  const user = await User.findOne({ email: userEmail });
  if (!user) throw requestError(404, 'No user was found for that email address');

  const [activities, workouts] = await Promise.all([
    Activity.find({ user: user._id }).sort({ occurredAt: -1 }).limit(5).select({ type: 1, _id: 0 }).lean(),
    Workout.find().lean(),
  ]);
  const preferences = [
    { focus: user.fitnessGoal.trim().toLowerCase(), reason: `Recommended to support your ${user.fitnessGoal} goal.` },
    ...activities.map(({ type }) => ({
      focus: focusForActivity(type),
      reason: `Recommended based on your recent ${type} activity.`,
    })),
  ].filter((preference, index, all) => all.findIndex((candidate) => candidate.focus === preference.focus) === index);

  return workouts
    .filter((workout) => preferences.some((preference) => preference.focus === workout.focus.trim().toLowerCase()))
    .sort((left, right) => {
      const leftPriority = preferences.findIndex((preference) => preference.focus === left.focus.trim().toLowerCase());
      const rightPriority = preferences.findIndex((preference) => preference.focus === right.focus.trim().toLowerCase());
      return leftPriority - rightPriority || left.title.localeCompare(right.title);
    })
    .map((workout) => {
      const preference = preferences.find((candidate) => candidate.focus === workout.focus.trim().toLowerCase());
      return { ...workout, reason: preference?.reason ?? '' };
    });
}

export { User };
