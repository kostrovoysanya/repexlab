import { isEmpty } from 'lodash';
import Logger from '../../utils/logger';
import Repexlab from '../../project/repexlab';
import { logError, logSuccess } from '../../utils/logger';
import { handler as compile } from './compile';

export const command = 'restoreSnapshot';
export const desc = 'Restore an existing Virtual Machine state from snapshot';
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
  logger.log('info', 'Restoring snapshot VM(s)');

  const repexlab = new Repexlab(stage);
  await repexlab.init('./');
  try {
    await repexlab.operations.restoreSnapshot(name, snapshotName);
    if (isEmpty(name)) {
      logger.log('info', 'Restored each VM state from snapshot');
    } else {
      logger.log('info', `Restored VM(s) '${name}' from snapshot`);
    }
  } catch (error) {
    if (isEmpty(name)) {
      logger.log('error', 'Failed to restore each VM state from snapshot', error);
    } else {
      logger.log('error', `Failed to restore VM(s) '${name}' from snapshot`, error);
    }
    logError(error);
  }
}
