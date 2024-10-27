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
    const c = new this(true);
    c.wsAutocloseDelay = autocloseTimeout;
    await c.initializeConnection(browserId, port, host);
    return c;
  }

  close() {
    clearTimeout(this.wsAutocloseTimeout);
    this.ws.close();
  }

  setAutocloseTimeout() {
    // Auto close the socket when not sending any commands
    this.wsAutocloseTimeout = setTimeout(() => this.close(), this.wsAutocloseDelay);
  }

  beforeAction() {
    clearTimeout(this.wsAutocloseTimeout);
  }

  afterAction() {
    this.setAutocloseTimeout();
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