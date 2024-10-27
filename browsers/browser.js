class Browser {
  wsAutocloseDelay;
  wsAutocloseTimeout = null;

  wsEndpoint;
  ws;

  constructor(staticInitUsed = false) {
    if (staticInitUsed !== true) {
      throw new Error('Do not instantiate this class by using the constructor. Instead, use the static async `init` method like `const browser = await Browser.init(...)`.');
    }
  }

  // Constructors cannot be async
  static async init(browserId, autocloseTimeout = 100, port = 9222, host = '127.0.0.1') {
    const browser = new this(true);
    browser.wsAutocloseDelay = autocloseTimeout;
    await browser.initializeConnection(browserId, port, host);

    // Run hooks before and after method calls
    return new Proxy(browser, {
      get(target, prop) {
        if (typeof target[prop] !== 'function') {
          return target[prop];
        }

        browser.beforeMethod();
        return async (...args) => {
          const result = await target[prop](...args);
          browser.afterMethod()
          return result;
        }
      }
    });
  }

  close() {
    clearTimeout(this.wsAutocloseTimeout);
    this.ws.close();
  }

  beforeMethod() {
    clearTimeout(this.wsAutocloseTimeout);
  }

  afterMethod() {
    // Auto close the socket when not sending any commands
    this.wsAutocloseTimeout = setTimeout(() => this.close(), this.wsAutocloseDelay);
  }

  #methodNotImplemented(methodName) {
    throw new Error(`Method '${this.constructor.name}.${methodName}' not implemented!`);
  }

  /* --- BROWSER-SPECIFIC METHODS --- */
  // Initialize the browser connection
  async initializeConnection(_browserId, _port, _host) {
    this.#methodNotImplemented('initializeConnection');
  }

  async navigate(_url) {
    this.#methodNotImplemented('navigate');
  }

  async click(_x, _y) {
    this.#methodNotImplemented('click');
  }
}

module.exports = Browser;