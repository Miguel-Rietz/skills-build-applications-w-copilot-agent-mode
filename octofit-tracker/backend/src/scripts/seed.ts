import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { Activity, Team, User, Workout } from '../models/index.js';

// Seed stable demo records without clearing data owned by the application.
async function upsertDemoUser(
  fixtureKey: string,
  name: string,
  email: string,
  teamId: InstanceType<typeof Team>['_id'],
  fitnessGoal: string,
) {
  const previousUser = await User.findOne({ fixtureKey }).select('_id team')
    ?? await User.findOne({ email }).select('_id team');
  if (previousUser?.team && previousUser.team.toString() !== teamId.toString()) {
    await Team.updateOne({ _id: previousUser.team }, { $pull: { members: previousUser._id } });
  }
  const user = previousUser
    ? await User.findOneAndUpdate(
      { _id: previousUser._id },
      { $set: { fixtureKey, name, email, team: teamId, fitnessGoal } },
      { new: true, runValidators: true },
    )
    : await User.findOneAndUpdate(
      { fixtureKey },
      { $set: { fixtureKey, name, email, team: teamId, fitnessGoal } },
      { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true },
    );
  if (!user) throw new Error(`Unable to upsert demo user fixture "${fixtureKey}"`);
  await Team.updateOne({ _id: teamId }, { $addToSet: { members: user._id } });
  return user;
}

export async function seed() {
  await connectDatabase();
  try {
    const octocats = await Team.findOneAndUpdate(
      { fixtureKey: 'octofit-demo:team:octocats' },
      { $set: { fixtureKey: 'octofit-demo:team:octocats', name: 'Octocats', mascot: 'Mona' } },
      { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true },
    );
    const robocats = await Team.findOneAndUpdate(
      { fixtureKey: 'octofit-demo:team:robocats' },
      { $set: { fixtureKey: 'octofit-demo:team:robocats', name: 'Robocats', mascot: 'Hubot' } },
      { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true },
    );
    const mona = await upsertDemoUser('octofit-demo:user:mona', 'Mona', 'mona@example.com', octocats._id, 'endurance');
    const hubot = await upsertDemoUser('octofit-demo:user:hubot', 'Hubot', 'hubot@example.com', robocats._id, 'strength');

    const monaRunAt = new Date('2026-01-10T12:00:00.000Z');
    const hubotCycleAt = new Date('2026-01-11T12:00:00.000Z');
    await Activity.updateOne(
      { fixtureKey: 'octofit-demo:activity:mona-run' },
      {
        $set: {
          fixtureKey: 'octofit-demo:activity:mona-run',
          user: mona._id,
          team: octocats._id,
          type: 'run',
          minutes: 40,
          points: 40,
          occurredAt: monaRunAt,
        },
      },
      { upsert: true, runValidators: true },
    );
    await Activity.updateOne(
      { fixtureKey: 'octofit-demo:activity:hubot-cycle' },
      {
        $set: {
          fixtureKey: 'octofit-demo:activity:hubot-cycle',
          user: hubot._id,
          team: robocats._id,
          type: 'cycle',
          minutes: 25,
          points: 25,
          occurredAt: hubotCycleAt,
        },
      },
      { upsert: true, runValidators: true },
    );
    await Workout.updateOne(
      { fixtureKey: 'octofit-demo:workout:intervals' },
      {
        $set: {
          fixtureKey: 'octofit-demo:workout:intervals',
          title: 'Intervals',
          focus: 'endurance',
          minutes: 30,
          difficulty: 'moderate',
        },
      },
      { upsert: true, runValidators: true },
    );
    await Workout.updateOne(
      { fixtureKey: 'octofit-demo:workout:strength-circuit' },
      {
        $set: {
          fixtureKey: 'octofit-demo:workout:strength-circuit',
          title: 'Strength Circuit',
          focus: 'strength',
          minutes: 30,
          difficulty: 'moderate',
        },
      },
      { upsert: true, runValidators: true },
    );
  } finally {
    await disconnectDatabase();
  }
}

if (process.argv[1]?.endsWith('seed.ts')) {
  await seed();
}
