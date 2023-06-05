import Logger from '../../utils/logger';
import Repexlab from '../../project/repexlab';
import { handler as compile } from './compile';

export const command = 'copy';
export const desc = 'Copy file or directory between host system and a single VM. Host path must be relative to the project';
export const builder = yargs => yargs
  .option('name', {
    alias: 'n',
    string: true,
    describe: 'VM name',
    requiresArg: true,
    required: true,
  })
  .option('direction', {
    alias: 'd',
    string: true,
    describe: 'Copy direction',
    requiresArg: true,
    required: true,
    choices: ['in', 'out'],
    default: 'in',
  })
  .option('from', {
    alias: 'f',
    string: true,
    describe: 'Copy from',
    requiresArg: true,
    required: true,
  })
  .option('to', {
    alias: 't',
    string: true,
    describe: 'Copy to',
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
  const {
    name, stage, direction, from, to
  } = argv;

  const logger = new Logger();
  logger.log('info', 'Copying VM(s)');

  const repexlab = new Repexlab(stage);
  await repexlab.init('./');
  try {
    await repexlab.operations.copy(name, direction, from, to);
    logger.log('info', `Transferred the target between host and VM '${name}'`);
  } catch (error) {
    logger.log('error', `Failed to transfer the target between host and VM '${name}'`, error);
  }
}
