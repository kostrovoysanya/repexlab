import { isEmpty } from 'lodash';
import { stringify } from 'yaml';
import Logger from '../../utils/logger';
import Repexlab from '../../project/repexlab';
import { handler as compile } from './compile';

export const command = 'status';
export const desc = 'Displays current status for all VMs or a single specified VM';
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
  logger.log('info', 'Status VM(s)');

  const repexlab = new Repexlab(stage);
  await repexlab.init('./');
  if (isEmpty(name)) {
    const statuses = await repexlab.operations.status();
    logger.log(name, 'info', 'VMs statuses:', statuses);
  } else {
    const statuses = await repexlab.operations.status(name);
    logger.log(name, 'info', `VM(s) '${name}' status:`, statuses);
  }
}
