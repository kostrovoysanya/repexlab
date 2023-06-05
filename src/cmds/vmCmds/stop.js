import { isEmpty } from 'lodash';
import { logSuccess } from '../../utils/logger';
import Logger from '../../utils/logger';
import Repexlab from '../../project/repexlab';
import { handler as compile } from './compile';

export const command = 'stop';
export const desc = 'Stops all VMs or a single specified VM';
export const builder = yargs => yargs
  .option('name', {
    alias: 'n',
    string: true,
    describe: 'VM name',
    requiresArg: true,
    required: false,
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
  logger.log('info', 'Stopping VM(s)')

  const repexlab = new Repexlab(stage);
  await repexlab.init('./');
  if (isEmpty(name)) {
    await repexlab.operations.stop();
    logger.log('info', 'Stopped all VMs');
  } else {
    await repexlab.operations.stop(name);
    logger.log('info', `Stopped VM(s) '${name}'`);
  }
}
