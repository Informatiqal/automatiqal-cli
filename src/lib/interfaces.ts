export interface IArguments {
  /**
   * File OR URL that contains the runbook
   */
  file?: string;
  /**
   * See: file
   */
  f?: string;
  /**
   * Specify if the runbook is in json format (default is yaml)
   */
  json?: boolean;
  /**
   * Path where to store the FULL result
   */
  output?: string;
  /**
   * See: output
   */
  o?: string;
  /**
   * Generate QSEoW sample runbook and variable files
   */
  "sample-win"?: string;
  /**
   * Generate SaaS sample runbook and variable files
   */
  "sample-saas"?: string;
  /**
   * Display the help
   */
  help?: boolean;
  /**
   * See: help
   */
  h?: boolean;
  /**
   * Path to the variables file
   */
  variables?: string;
  /**
   * See: variables
   */
  var?: string;
  /**
   * See: variables
   */
  v?: string;
  /**
   * Test connectivity. No task as ran
   */
  connect?: boolean;
  /**
   * See: connect
   */
  c?: boolean;
  /**
   * Use global variables file as source for variables values
   * @default false
   */
  global?: string;
  /**
   * See: global
   */
  g?: string;
  /**
   * Use the environment variables as source for variable values
   *
   * @default false
   */
  env: boolean;
  /**
   * See: env
   */
  e?: boolean;
  /**
   * Provide inline/command variables values
   *
   * ```
   * --inline "my-variable=value123; another-variable = 456"
   * ```
   */
  inline?: string;
  /**
   * See: inline
   */
  i?: string;
  /**
   * Path where to store the runbook messages output
   */
  result: string;
  /**
   * See result
   */
  r: string;
  /**
   * Output the full result directly in the console
   */
  raw?: boolean;
}
