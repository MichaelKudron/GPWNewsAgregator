export const environment = {
  production: false,
  // Dev idzie przez gateway. Host-port 18080 (8080 bywa zajęty przez zarezerwowany
  // zakres portów WinNAT na Windows — mapowanie w docker-compose.dev.yml).
  apiUrl: 'http://localhost:18080',
  articleApiUrl: 'http://localhost:18080',
};
