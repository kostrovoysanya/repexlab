import { isEmpty } from 'lodash';
import { logSuccess } from '../../utils/logger';
import Repexlab from '../../project/repexlab';
import { handler as compile } from './compile';

export const command = 'start';
export const desc = 'Starts all VMs or a single specified VM';
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

  const repexlab = new Repexlab(stage);
  await repexlab.init('./');
  if (isEmpty(name)) {
    await repexlab.operations.start();
    logSuccess('Started all VMs');
  } else {
    await repexlab.operations.start(name);
    logSuccess(`Started VM '${name}'`);
  }
}
