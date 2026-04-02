import { Redis, Cluster, ClusterNode, ClusterOptions, RedisOptions } from 'ioredis';
import { logger } from '../logger';

function resolveRedisUrl(): string {
  if (process.env.REDIS_URL) {
    return process.env.REDIS_URL;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'FATAL: REDIS_URL environment variable is not set. ' +
      'The application refuses to start in production without an explicit Redis URL.',
    );
  }

  // Non-production: fall back to standard local dev default
  logger.warn(
    'REDIS_URL is not set. Falling back to redis://localhost:6379 (development only). ' +
    'Set REDIS_URL in your environment for production.',
  );
  return 'redis://localhost:6379';
}

const redisUrl = resolveRedisUrl();
const isClusterMode = process.env.REDIS_CLUSTER_MODE === 'true';

const getClusterNodes = (): ClusterNode[] => {
  if (process.env.REDIS_CLUSTER_NODES) {
    return process.env.REDIS_CLUSTER_NODES.split(',').map((node) => {
      const [host, port] = node.split(':');
      return { host, port: port ? parseInt(port, 10) : 6379 };
    });
  }
  
  // Extract host/port from URL as fallback
  try {
    const url = new URL(redisUrl);
    return [{ host: url.hostname, port: parseInt(url.port || '6379', 10) }];
  } catch (e) {
    return [{ host: '127.0.0.1', port: 6379 }];
  }
};

class RedisClientManager {
  public client: Redis | Cluster;
  
  constructor(clientType: 'Main' | 'Publisher' | 'Subscriber' = 'Main') {
    if (isClusterMode) {
      const nodes = getClusterNodes();
      const options: ClusterOptions = {
        redisOptions: {
          enableReadyCheck: false,
          maxRetriesPerRequest: null,
        },
        clusterRetryStrategy: (times) => Math.min(times * 200, 5000),
      };
      
      this.client = new Cluster(nodes, options);
      
      this.client.on('error', (err) => {
        logger.error(`Redis Cluster (${clientType}) error:`, err);
      });

      this.client.on('connect', () => {
        logger.info(`Redis Cluster (${clientType}) connected successfully`);
      });
    } else {
      const options: RedisOptions = {
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
        retryStrategy: (times) => Math.min(times * 100, 3000),
      };
      
      this.client = new Redis(redisUrl, options);
      
      this.client.on('error', (err) => {
        logger.error(`Redis (${clientType}) connection error:`, err);
      });

      this.client.on('connect', () => {
        logger.info(`Redis (${clientType}) connected successfully to ` + redisUrl);
      });
    }
  }
}

export const redisInstance = new RedisClientManager('Main').client;

// Separate connections for pub/sub as a single connection cannot subscribe and publish at the same time
export const redisPublisher = new RedisClientManager('Publisher').client;
export const redisSubscriber = new RedisClientManager('Subscriber').client;
