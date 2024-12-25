const { createClient }  =  require('redis');

const client = createClient({
  password: 'RXzfPiadh5bFkN5LyYwmCLjYQhksllFS',
  socket: {
    
    host: 'redis-13648.c84.us-east-1-2.ec2.redns.redis-cloud.com',
    port: 13648
  }
});



client.on('connect', () => {
    console.log('Connected to Redis');
  });

  client.on('error', (err) => {
    console.error('Redis Client Error:', err);
  });
  
client.connect()
module.exports = client