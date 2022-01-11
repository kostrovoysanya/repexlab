import { isEmpty } from 'lodash';
import { logSuccess } from '../../utils/logger';
import Virtstand from '../../project/virtstand';
import { handler as compile } from './compile';

export const command = 'restart';
export const desc = 'Restarts all VMs or a single specified VM';
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

  const virtstand = new Virtstand();
  await virtstand.init('./', stage);
  if (isEmpty(name)) {
    await virtstand.restart();
    logSuccess('Restarted all VMs');
  } else {
    await virtstand.restart(name);
    logSuccess(`Restarted VM '${name}'`);
  }
}
