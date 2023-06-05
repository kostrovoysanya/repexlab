import { isEmpty } from 'lodash';
import Logger from '../../utils/logger';
import Repexlab from '../../project/repexlab';
import { logError, logSuccess } from '../../utils/logger';
import { handler as compile } from './compile';

export const command = 'saveSnapshot';
export const desc = 'Save an existing Virtual Machine state to a snapshot';
export const builder = yargs => yargs
  .option('name', {
    alias: 'n',
    string: true,
    describe: 'VM name',
    requiresArg: true,
    required: true,
  })
  .option('snapshotName', {
    alias: 'sn',
    string: true,
    describe: 'Snapshot name',
    requiresArg: true,
    required: true,
  })
  .option('stage', {
    alias: 's',
    string: true,
    describe: 'Stage name',
    requiresArg: true,
    required: false,
  });

export const handler = async argv => {
  await compile(argv);
  await run(argv);
};

export async function run(argv) {
  const { name, stage, snapshotName } = argv;

  const logger = new Logger();
  logger.log('info', 'Saving snapshots VM(s)');

  const repexlab = new Repexlab(stage);
  await repexlab.init('./');
  try {
    await repexlab.operations.saveSnapshot(name, snapshotName);
    if (isEmpty(name)) {
      logger.log('info', 'Saved snapshot for each of VMs');
    } else {
      logger.log('info', `Saved snapshot of VM(s) '${name}'`);
    }
  } catch (error) {
    if (isEmpty(name)) {
      logger.log('error', 'Failed to save snapshot for each of VMs', error);
    } else {
      logger.log('error', `Failed to save snapshot of VM(s) '${name}'`, error);
    }
    logError(error);
  }
}
