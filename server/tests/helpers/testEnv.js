// Imported first by the API tests. It points the app at a port where no
// database is listening, so these tests never touch real data and we can check
// how the API behaves when MySQL is unreachable.
process.env.NODE_ENV = 'test';
process.env.DB_HOST = '127.0.0.1';
process.env.DB_PORT = '1';
