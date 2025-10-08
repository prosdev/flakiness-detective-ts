Object.defineProperty(exports, '__esModule', { value: true });
exports.Logger = void 0;
exports.createLogger = createLogger;
class Logger {
  level;
  coreService;
  constructor(coreService, config) {
    this.coreService = coreService;
    this.level = config.level;
  }
  log(message) {
    console.log(`[${this.level.toUpperCase()}] ${message}`);
  }
  getServiceInfo() {
    return `Logger using API Key: ${this.coreService.getApiKey()}`;
  }
}
exports.Logger = Logger;
function createLogger(coreService, config) {
  return new Logger(coreService, config);
}
//# sourceMappingURL=index.js.map
