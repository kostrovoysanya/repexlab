import moment from 'moment';
import { ensureDir } from 'fs-extra';
import winston from 'winston';
import { map } from 'lodash';

export default class Logger {
  constructor() {
    this.init();
  }

  async init() {
    // Create a log directory if it doesn't already exist
    await ensureDir('./.repexlab/logs');

    // Creating logger for framework
    this.frameworkLogger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        // File transport
        new winston.transports.File({
          filename: './.repexlab/logs/framework.log',
          level: 'info'
        }),
        //File console
        new winston.transports.Console({
          level: 'info',
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        })
      ]
    });

    // Create an object for storing virtual machine loggers
    this.virtualMachineLoggers = {};
  }

  async createVirtualMachineLogger(name) {
    const createLogger = async (vmName) => {
      const directory = `./vms/${vmName}/logs`;
      try {
        // Create a log directory if it doesn't already exist
        await ensureDir(directory);
        // Creating logger for virtual machine
        const virtualMachineLogger = winston.createLogger({
          level: 'info',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          ),
          transports: [
            // File transport
            new winston.transports.File({
              filename: `${directory}/${vmName}.log`,
              level: 'info'
            })
          ]
        });
        this.virtualMachineLoggers[vmName] = virtualMachineLogger;
      } catch (err) {
        console.error(`Failed to create directory: ${directory}`, err);
      }
    };

    if (name.includes(',')) {
      const vmNames = name.split(',');
      await Promise.all(map(vmNames, (vmName) => createLogger(vmName.trim())));
    } else {
      await createLogger(name);
    }
  }

  async log(level, message, meta = {}) {
    if (!this.frameworkLogger) {
      await this.init();
    }
  
    if (this.frameworkLogger) {
      // const formattedMessage = util.inspect(message, { depth: null });
      this.frameworkLogger.log(level, message, meta = {});
    } else {
      console.error('Failed to initialize framework logger');
    }
  }

  async logVirtualMachine(name, level, message, meta = {}) {
    const vmNames = name.includes(',') ? name.split(',') : [name];
  
    await Promise.all(
      map(vmNames, async (vmName) => {
        if (!this.virtualMachineLoggers[vmName]) {
          console.warn(`Logger for virtual machine ${vmName} is not created. Creating one now.`);
          await this.createVirtualMachineLogger(vmName);
        }
        if (!this.virtualMachineLoggers[vmName]) {
          console.error(`Failed to create logger for virtual machine: ${vmName}`);
          return;
        }
        this.virtualMachineLoggers[vmName].log(level, message, meta);
      })
    );
  }  
  
  async logFrameworkAndVirtualMachine(name, level, message, meta = {}) {
    await this.log(level, message, meta);
  
    const vmNames = name.includes(',') ? name.split(',') : [name];
  
    await Promise.all(
      map(vmNames, async (vmName) => {
        if (!this.virtualMachineLoggers[vmName]) {
          console.warn(`Logger for virtual machine ${vmName} is not created. Creating one now.`);
          await this.createVirtualMachineLogger(vmName);
        }
        if (this.virtualMachineLoggers[vmName]) {
          await this.logVirtualMachine(vmName, level, message, meta);
        } else {
          console.error(`Failed to create logger for virtual machine: ${vmName}`);
        }
      })
    );
  }
}

const logger = new Logger();

const now = () => moment().format('HH:mm:ss');

export const logSuccess = msg => console.log(`[${now()}] ${chalkMsg(msg, msgTypes.SUCCESS)}`);

export const logInfo = msg => console.log(`[${now()}] ${chalkMsg(msg, msgTypes.INFO)}`);

export const logError = msg => console.log(`[${now()}] ${chalkMsg(msg, msgTypes.ERROR)}`);

export const logWarning = msg => console.log(`[${now()}] ${chalkMsg(msg, msgTypes.WARNING)}`);

export const logProcessingStep = (msg, step, totalStep) => {
  const steps = chalkMsg(`[${step}/${totalStep}]`, msgTypes.FADED);
  console.log(`${steps} ${chalkMsg(msg, msgTypes.INFO)}`);
};

export const logScream = msg => {
  const scream = emojiMsg(icons.SCREAM);
  console.log(
    `${scream} ${scream} ${scream}  ${chalkMsg(
      msg,
      msgTypes.SCREAM
    )}  ${scream} ${scream} ${scream}`
  );
};
