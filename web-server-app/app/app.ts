export default class AppBootHook {
  constructor() {
    // constructor
  }

  configWillLoad() {
    // The config file has been read and merged, but it has not yet taken effect
    // This is the last time the application layer modifies the configuration
    // Note: This function only supports synchronous calls.
  }

  async didLoad() {
    // All configurations have been loaded
    // Can be used to load the application custom file, start a custom service
  }

  async willReady() {
    // All plugins have been started, but the application is not yet ready
    // Can do some data initialization and other operations
    // Application will start after these operations executed succcessfully
  }

  async didReady() {
    // Application already ready
  }

  async serverDidReady() {
    // http / https server has started and begins accepting external requests
    // At this point you can get an instance of server from app.server
  }
}
