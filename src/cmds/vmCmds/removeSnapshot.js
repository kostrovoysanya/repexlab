import { isEmpty } from 'lodash';
import Logger from '../../utils/logger';
import Repexlab from '../../project/repexlab';
import { logError, logSuccess } from '../../utils/logger';
import { handler as compile } from './compile';

export const command = 'removeSnapshot';
export const desc = 'Remove an existing Virtual Machine snapshot';
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
  logger.log('info', 'Removing snapshot VM(s)');

  const repexlab = new Repexlab(stage);
  await repexlab.init('./');
  try {
    await repexlab.operations.removeSnapshot(name, snapshotName);
    if (isEmpty(name)) {
      logger.log('info', 'Removed snapshot for each of VMs');
    } else {
      logger.log('info', `Removed snapshot of VM(s) '${name}'`);
    }
  } catch (error) {
    if (isEmpty(name)) {
      logger.log('error', 'Failed to remove snapshot for each of VMs', error);
    } else {
      logger.log('error', `Failed to remove snapshot of VM(s) '${name}'`, error);
    }
    logError(error);
  }
}
