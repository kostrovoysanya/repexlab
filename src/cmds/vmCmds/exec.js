import { isEmpty } from 'lodash';
import Logger from '../../utils/logger';
import Repexlab from '../../project/repexlab';
import { handler as compile } from './compile';

export const command = 'exec';
export const desc = 'Executes a command on a single specified VM';
export const builder = yargs => yargs
  .option('name', {
    alias: 'n',
    string: true,
    describe: 'VM name',
    requiresArg: true,
    required: true,
  })
  .option('command', {
    alias: 'c',
    string: true,
    describe: 'Command',
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
  const { name, stage } = argv;

  const logger = new Logger();
  logger.log('info', 'Executing the command on VM(s)');

  const repexlab = new Repexlab(stage);
  await repexlab.init('./');
  try {
    await repexlab.operations.exec(name, argv.command);
    if (isEmpty(name)) {
      logger.log('info', 'Executed the command on all VMs.');
    } else {
      logger.log('info', `Executed the command on VM(s) '${name}'`);
    }
  } catch (error) {
    if (isEmpty(name)) {
      logger.log('error', 'Failed to execute the command on all VMs', error);
    } else {
      logger.log('error', `Failed to execute the command on VM '${name}'`, error);
    }
    logError(error);
  }
}
