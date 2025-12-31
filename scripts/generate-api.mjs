import { resolve, isAbsolute } from 'node:path';
import { existsSync } from 'node:fs';
import { generateApi } from 'swagger-typescript-api';

const projectRoot = process.cwd();
const output = resolve(projectRoot, './src/api');

const swaggerEnv = process.env.SWAGGER_PATH ?? process.env.SWAGGER_URL;
const defaultUrl = 'http://localhost:8081/v3/api-docs';

const isHttp = (value) => typeof value === 'string' && /^https?:\/\//i.test(value);

const source = (() => {
  if (!swaggerEnv) {
    return { url: defaultUrl };
  }

  if (isHttp(swaggerEnv)) {
    return { url: swaggerEnv };
  }

  const fullPath = isAbsolute(swaggerEnv) ? swaggerEnv : resolve(projectRoot, swaggerEnv);
  if (!existsSync(fullPath)) {
    throw new Error(`Swagger schema file not found: ${fullPath}`);
  }

  return { input: fullPath };
})();

console.log('[swagger] Generating TypeScript client to', output);

await generateApi({
  name: 'Api.ts',
  output,
  httpClientType: 'axios',
  generateRouteTypes: true,
  generateResponses: true,
  extractRequestBody: true,
  unwrapResponseData: true,
  singleHttpClient: true,
  cleanOutput: false,
  ...source,
});

console.log('[swagger] Done');

