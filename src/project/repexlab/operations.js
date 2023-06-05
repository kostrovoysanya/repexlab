import {
  castArray, compact, filter, first, includes, isEmpty, map, reduce
} from 'lodash';
import { join } from 'path';
import Logger from '../../utils/logger';

export default class RepexlabOperations {
  constructor(workingDirectory, virtualMachines) {
    this.workingDirectory = workingDirectory;
    this.virtualMachines = virtualMachines;
    this.logger = new Logger();
  }

  // setVirtualMachines(virtualMachines) {
  //   this.virtualMachines = virtualMachines;
  // }

  async runParallel(virtualMachines, action) {
    return Promise.all(map(virtualMachines, async (virtualMachine) => action(virtualMachine)));
  }

  async runSequential(virtualMachines, action) {
    return reduce(virtualMachines, async (acc, virtualMachine) => {
      const results = await acc;
      const result = await action(virtualMachine);
      return [...results, result];
    }, Promise.resolve([]));
  }

  getVMsByNames(names) {
    const vmNames = compact(castArray(names));
    const vms = filter(
      this.virtualMachines,
      (vm) => isEmpty(names) || (includes(vmNames, vm.name))
    );
    return vms;
  }

  async compile(names) {
    this.logger.log('info', `Compiling virtual machine(s) '${names}'`);
    const results = await this.runParallel(
      this.getVMsByNames(names),
      async (virtualMachine) => virtualMachine.compile()
    );
    this.logger.log('info', `Compilation of virtual machine(s) '${names}' finished`);
  }

  async start(names) {
    this.logger.log('info', `Starting virtual machine(s) '${names}'`);
    await this.runSequential(
      this.getVMsByNames(names),
      async (virtualMachine) => virtualMachine.operations.start()
    );
    this.logger.log('info', `Virtual machine(s) '${names}' started`);
  }

  async restart(names) {
    this.logger.log('info', `Restarting virtual machine(s) '${names}'`);
    await this.runSequential(
      this.getVMsByNames(names),
      async (virtualMachine) => virtualMachine.operations.restart()
    );
    this.logger.log('info', `Virtual machine(s) '${names}' restarted`);;
  }

  async setupHosts(names) {
    this.logger.log('info', 'setupHosts');
    await this.runParallel(
      this.getVMsByNames(names),
      async (virtualMachine) => virtualMachine.operations.setupHosts(
        this.virtualMachines
      )
    );
    this.logger.log('info', 'setupHosts finished');
  }

  async provision(names) {
    this.logger.log('info', `Provisioning for virtual machine(s) '${names}'`);
    await this.runParallel(
      this.getVMsByNames(names),
      async (virtualMachine) => virtualMachine.operations.provision(
        this.workingDirectory,
        virtualMachine
      )
    );
    this.logger.log('info', `Provisioning for virtual machine(s) '${names}' finished`);
  }

  async stop(names) {
    this.logger.log('info', `Stopping for virtual machine(s) '${names}'`);
    await this.runParallel(
      this.getVMsByNames(names),
      async (virtualMachine) => virtualMachine.operations.stop()
    );
    this.logger.log('info', `Stopping for virtual machine(s) '${names}' finished`);
  }

  async destroy(names) {
    this.logger.log('info', `Destroyng virtual machine(s) '${names}'`);
    await this.runParallel(
      this.getVMsByNames(names),
      async (virtualMachine) => virtualMachine.operations.destroy()
    );
    this.logger.log('info', `Destroying virtual machine(s) '${names}' finished`);
  }

  async status(names) {
    this.logger.log('info', 'Check status');
    return this.runParallel(this.getVMsByNames(names), async (virtualMachine) => {
      const status = await virtualMachine.operations.status();
      return `${virtualMachine.name}: ${status}`;
    });
  }

  async ssh(names) {
    this.logger.log('info', 'ssh');
    const virtualMachine = first(this.getVMsByNames(names));
    await virtualMachine.operations.ssh();
    this.logger.log('info', 'ssh finished');
  }

  async exec(names, command) {
    this.logger.log('info', 'exec');
    await this.runParallel(
      this.getVMsByNames(names),
      async (virtualMachine) => virtualMachine.operations.exec(command)
    );
    this.logger.log('info', 'exec finished');
  }

  async report(names, timestamp, start, end, labels) {
    this.logger.log(`Reporting virtual machine(s) '${names}'`);
    await this.runParallel(
      this.getVMsByNames(names),
      async (virtualMachine) => {
        const destination = join(this.workingDirectory, `reports/${timestamp}/${virtualMachine.name}`);
        return virtualMachine.operations.report(destination, start, end, labels);
      }
    );
    this.logger.log('info', `Reporting virtual machine(s) '${names}' finished`);
  }

  async copy(names, direction, from, to) {
    this.logger.log('info', `Copying virtual machine(s) '${names}'`);
    await this.runParallel(
      this.getVMsByNames(names),
      async (virtualMachine) => virtualMachine.operations.copy(
        this.workingDirectory,
        direction,
        from,
        to
      )
    );
    this.logger.log('info', `Reporting virtual machine(s) '${names}' finished`);
  }

  async saveSnapshot(names, snapshotName) {
    this.logger.log('info', `Saving snapshot from virtual machine(s) '${names}'`);
    await this.runSequential(
      this.getVMsByNames(names),
      async (virtualMachine) => virtualMachine.operations.saveSnapshot(snapshotName)
    );
    this.logger.log('info', `Saving snapshot from virtual machine(s) '${names}' finished`);
  }

  async restoreSnapshot(names, snapshotName) {
    this.logger.log('info', `Restoring snapshot from virtual machine(s) '${names}'`);
    await this.runSequential(
      this.getVMsByNames(names),
      async (virtualMachine) => virtualMachine.operations.restoreSnapshot(snapshotName)
    );
    this.logger.log('info', `Restoring snapshot from virtual machine(s) '${names}' finished`);
  }

  async removeSnapshot(names, snapshotName) {
    this.logger.log('info', `Removing snapshot from virtual machine(s) '${names}'`);
    await this.runSequential(
      this.getVMsByNames(names),
      async (virtualMachine) => virtualMachine.operations.removeSnapshot(snapshotName)
    );
    this.logger.log('info', `Removing snapshot from virtual machine(s) '${names}' finished`);
  }

  async listSnapshots(names) {
    this.logger.log('info', 'ListSnapshots');
    return this.runParallel(this.getVMsByNames(names), async (virtualMachine) => {
      const snapshots = await virtualMachine.operations.listSnapshots();
      return `${virtualMachine.name}: ${snapshots}`;
    });
  }
}
