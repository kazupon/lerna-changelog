export default class ConfigurationError extends Error {
  public name = 'ConfigurationError'

  constructor(message: string) {
    super(message)
  }
}
