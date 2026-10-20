import { Activity, Team, User, Workout } from '../models/index.js';


export async function listActivities() {
  return Activity.find().lean();
}

function requestError(status: number, message: string) {
  return Object.assign(new Error(message), { status });
}

export async function createActivity(input: unknown) {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    throw requestError(400, 'Activity input must be an object');
  }

  const { userId, teamId, type, minutes } = input as Record<string, unknown>;
  const objectIdPattern = /^[a-f\d]{24}$/i;
  if (typeof userId !== 'string' || !objectIdPattern.test(userId)
    || typeof teamId !== 'string' || !objectIdPattern.test(teamId)) {
    throw requestError(400, 'Valid userId and teamId are required');
  }
  if (typeof type !== 'string' || type.trim().length === 0
    || typeof minutes !== 'number' || !Number.isFinite(minutes) || minutes <= 0) {
    throw requestError(400, 'Activity type and positive minutes are required');
  }

  const [user, team] = await Promise.all([
    User.exists({ _id: userId }),
    Team.exists({ _id: teamId }),
  ]);
  if (!user) throw requestError(404, 'User not found');
  if (!team) throw requestError(404, 'Team not found');

  return Activity.create({
    user: userId,
    team: teamId,
    type: type.trim(),
    minutes,
    points: minutes,
    occurredAt: new Date(),
  });
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    throw requestError(400, 'Team input must be an object');
  }

  const { name, mascot, members } = input as Record<string, unknown>;
  if (typeof name !== 'string' || name.trim().length === 0) {
    throw requestError(400, 'Team name is required');
  }
  if (typeof mascot !== 'string' || mascot.trim().length === 0) {
    throw requestError(400, 'Team mascot is required');
  }
  if (members !== undefined && !Array.isArray(members)) {
    throw requestError(400, 'Team members must be an array of user IDs');
  }

  const memberIds = (members ?? []) as unknown[];
  const objectIdPattern = /^[a-f\d]{24}$/i;
  if (!memberIds.every((memberId) => typeof memberId === 'string' && objectIdPattern.test(memberId))) {
    throw requestError(400, 'Team member IDs must be valid');
  }

  const uniqueMemberIds = [...new Set(memberIds as string[])];
  if (uniqueMemberIds.length > 0) {
    const existingMembers = await User.countDocuments({ _id: { $in: uniqueMemberIds } });
    if (existingMembers !== uniqueMemberIds.length) {
      throw requestError(404, 'One or more team members were not found');
    }
  }

  return Team.create({ name: name.trim(), mascot: mascot.trim(), members: uniqueMemberIds });
}

export async function getLeaderboard() {
  const teams = await Team.aggregate<{ teamName: string; totalPoints: number }>([
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
        _id: 0,
        teamName: '$name',
        totalPoints: { $sum: '$activities.points' },
      },
    },
    { $sort: { totalPoints: -1, teamName: 1 } },
  ]).exec();

  return teams.map((team, index) => ({ ...team, rank: index + 1 }));
}

export async function suggestWorkouts(userEmail: string) {
  const normalizedEmail = userEmail.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail }).lean();
  if (!user) throw requestError(404, 'User not found');

  const [workouts, recentActivities] = await Promise.all([
    Workout.find().lean(),
    Activity.find({ user: user._id }).sort({ occurredAt: -1 }).limit(5).lean(),
  ]);
  const normalizeFocus = (focus: string) => focus.trim().toLowerCase();
  const activityFocus: Record<string, string> = {
    run: 'endurance',
    running: 'endurance',
    walk: 'endurance',
    cycle: 'endurance',
    cycling: 'endurance',
    swim: 'endurance',
    strength: 'strength',
    weights: 'strength',
    yoga: 'mobility',
    stretch: 'mobility',
    stretching: 'mobility',
  };
  const goalFocus = normalizeFocus(user.fitnessGoal ?? '');
  const candidateFocuses = [
    goalFocus,
    ...recentActivities.map((activity) => {
      const type = normalizeFocus(activity.type);
      return activityFocus[type] ?? type;
    }),
  ].filter((focus) => focus.length > 0);
  const selectedFocus = candidateFocuses.find((focus) =>
    workouts.some((workout) => normalizeFocus(workout.focus) === focus),
  );
  if (!selectedFocus) return [];

  const matchingActivity = recentActivities.find((activity) => {
    const type = normalizeFocus(activity.type);
    return (activityFocus[type] ?? type) === selectedFocus;
  });
  const reason = matchingActivity
    ? `Recommended for your ${selectedFocus} goal and recent ${matchingActivity.type} activity.`
    : `Recommended because it matches your ${selectedFocus} goal.`;

  return workouts
    .filter((workout) => normalizeFocus(workout.focus) === selectedFocus)
    .sort((left, right) => left.minutes - right.minutes || (left.title ?? '').localeCompare(right.title ?? ''))
    .map((workout) => ({ ...workout, reason }));
}

export { User };
